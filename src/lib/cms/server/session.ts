import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { adminAuth, database } from "./firebase";
import { HttpError } from "./http";
export const COOKIE = "__session";
export const IDLE_MS = 15 * 60_000;
const SESSION_MS = 8 * 60 * 60_000;
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const ref = database().collection("cms_sessions").doc(hash(token));
  const stored = await ref.get();
  const data = stored.data();
  if (
    !data ||
    data.expiresAt <= Date.now() ||
    data.lastActivity <= Date.now() - IDLE_MS
  )
    return null;
  const user = await adminAuth().getUser(data.uid);
  if (
    user.disabled ||
    user.customClaims?.beyonnAdmin !== true ||
    new Date(user.tokensValidAfterTime ?? 0).getTime() > data.createdAt
  )
    return null;
  return {
    ref,
    uid: user.uid,
    email: user.email,
    createdAt: data.createdAt as number,
    lastActivity: data.lastActivity as number,
  };
}
export async function requireAdmin() {
  const session = await getSession();
  if (!session)
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  return session;
}
export async function createSession(uid: string) {
  const old = (await cookies()).get(COOKIE)?.value;
  if (old && /^[a-f0-9]{64}$/.test(old))
    await database().collection("cms_sessions").doc(hash(old)).delete();
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  await database()
    .collection("cms_sessions")
    .doc(hash(token))
    .set({
      uid,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + SESSION_MS,
    });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}
export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token))
    await database().collection("cms_sessions").doc(hash(token)).delete();
  jar.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
export async function consumeLoginAttempt() {
  const ref = database().collection("cms_limits").doc("admin-login");
  const now = Date.now();
  // A persistent account-wide limit cannot be bypassed by spoofing proxy/IP headers.
  await database().runTransaction(async (tx) => {
    const data = (await tx.get(ref)).data();
    const count = data && data.windowEnds > now ? (data.count as number) : 0;
    if (count >= 8)
      throw new HttpError(
        429,
        "Too many sign-in attempts. Please wait 15 minutes.",
      );
    tx.set(ref, {
      count: count + 1,
      windowEnds:
        data && data.windowEnds > now ? data.windowEnds : now + 15 * 60_000,
    });
  });
}
