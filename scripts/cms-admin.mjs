import nextEnv from "@next/env";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
nextEnv.loadEnvConfig(process.cwd());
const email = process.env.CMS_ADMIN_EMAIL;
const password = process.env.CMS_ADMIN_PASSWORD;
if (!email || !process.env.FIREBASE_PROJECT_ID) {
  console.error(
    "Set CMS_ADMIN_EMAIL and Firebase server configuration. New accounts also require CMS_ADMIN_PASSWORD.",
  );
  process.exit(1);
}
try {
  const app = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  const auth = getAuth(app);
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    if (!password || password.length < 12)
      throw new Error(
        "A new account requires a password of at least 12 characters.",
      );
    user = await auth.createUser({
      email,
      password,
      displayName: "Beyonn Administrator",
    });
  }
  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    beyonnAdmin: true,
  });
  console.log(
    "Admin account authorized. Existing account passwords are preserved.",
  );
} catch (error) {
  console.error(
    "Admin setup failed:",
    error.code ?? "Check the Firebase configuration and account permissions.",
  );
  process.exit(1);
}
