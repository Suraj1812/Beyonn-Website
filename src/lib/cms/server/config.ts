import "server-only";
function object(value: string | undefined): Record<string, string> {
  if (!value?.startsWith("{")) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
export function firebaseSettings() {
  const native = object(process.env.FIREBASE_CONFIG);
  const web = object(process.env.FIREBASE_WEBAPP_CONFIG);
  return {
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      native.projectId ||
      web.projectId ||
      process.env.GOOGLE_CLOUD_PROJECT,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      native.storageBucket ||
      web.storageBucket,
    apiKey: process.env.FIREBASE_WEB_API_KEY || web.apiKey,
  };
}
