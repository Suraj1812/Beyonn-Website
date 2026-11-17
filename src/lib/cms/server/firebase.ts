import "server-only";
import { firebaseSettings } from "./config";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
export function firebaseApp() {
  const settings = firebaseSettings();
  if (!settings.projectId) throw new Error("Firebase is not configured.");
  return (
    getApps()[0] ??
    initializeApp({
      credential: process.env.FIREBASE_ADMIN_CREDENTIALS
        ? cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS))
        : applicationDefault(),
      projectId: settings.projectId,
      storageBucket: settings.storageBucket,
    })
  );
}
export const adminAuth = () => getAuth(firebaseApp());
export const database = () => getFirestore(firebaseApp());
export const bucket = () => getStorage(firebaseApp()).bucket();
