import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging as getFirebaseMessaging, type Messaging } from "firebase-admin/messaging";

import { env } from "./env";
import { logger } from "../utils/logger";

let app: App | null | undefined;

const normalizePrivateKey = (value: string): string => value.replace(/\\n/g, "\n");

const initializeFirebase = (): App | null => {
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  const existing = getApps()[0];
  if (existing) {
    return existing;
  }

  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(env.FIREBASE_PRIVATE_KEY),
    }),
  });
};

export const getMessaging = (): Messaging | null => {
  if (app === undefined) {
    app = initializeFirebase();
    if (!app) {
      logger.info("Firebase Admin is not configured. Push notifications are disabled.");
    }
  }

  if (!app) {
    return null;
  }

  return getFirebaseMessaging(app);
};
