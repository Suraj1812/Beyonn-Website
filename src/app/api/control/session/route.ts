import { firebaseSettings } from "@/lib/cms/server/config";
import { adminAuth, database } from "@/lib/cms/server/firebase";
import {
  consumeLoginAttempt,
  createSession,
  deleteSession,
  getSession,
  requireAdmin,
} from "@/lib/cms/server/session";
import {
  failure,
  HttpError,
  json,
  parseJson,
  sameOrigin,
} from "@/lib/cms/server/http";
export async function GET() {
  try {
    const session = await getSession();
    return json({ authenticated: !!session, email: session?.email });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const value = (await parseJson(request, 4096)) as {
      email?: unknown;
      password?: unknown;
    };
    if (
      typeof value.email !== "string" ||
      typeof value.password !== "string" ||
      value.email.length > 254 ||
      value.password.length > 256 ||
      !value.email ||
      !value.password
    )
      throw new HttpError(400, "Enter your admin ID and password.");
    await consumeLoginAttempt();
    const { apiKey } = firebaseSettings();
    if (!apiKey) throw new Error("Firebase web configuration is missing.");
    const authOrigin = process.env.FIREBASE_AUTH_EMULATOR_HOST
      ? `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com`
      : "https://identitytoolkit.googleapis.com";
    const result = await fetch(
      `${authOrigin}/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: value.email.trim(),
          password: value.password,
          returnSecureToken: true,
        }),
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      },
    );
    if (!result.ok) {
      const provider = await result.json();
      const code = provider.error?.message;
      if (code === 'CONFIGURATION_NOT_FOUND' || code === 'OPERATION_NOT_ALLOWED') throw new HttpError(503, 'Admin sign-in is not enabled yet. Enable Email/Password in the Beyonn Firebase project.');
      if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') throw new HttpError(429, 'Too many sign-in attempts. Please try again later.');
      throw new HttpError(401, "The admin ID or password is incorrect.");
    }
    const credentials = await result.json();
    const user = await adminAuth().getUser(credentials.localId);
    if (user.disabled || user.customClaims?.beyonnAdmin !== true)
      throw new HttpError(401, "The admin ID or password is incorrect.");
    await createSession(user.uid);
    await database().collection("cms_limits").doc("admin-login").delete();
    return json({ authenticated: true });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const session = await requireAdmin();
    await session.ref.update({ lastActivity: Date.now() });
    return json({ authenticated: true });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    await deleteSession();
    return json({ authenticated: false });
  } catch (e) {
    return failure(e);
  }
}
