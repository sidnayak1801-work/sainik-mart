import { describe, expect, test } from "vitest";

import { getFirebaseVapidKey, getFirebaseWebConfig, isFirebaseWebConfigured } from "./config";

const completeEnv = {
  VITE_FIREBASE_API_KEY: "test-key",
  VITE_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "demo",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "123",
  VITE_FIREBASE_APP_ID: "1:123:web:abc",
  VITE_FIREBASE_VAPID_KEY: "vapid",
};

describe("firebase web config", () => {
  test("is incomplete until every public Firebase key is set", () => {
    expect(isFirebaseWebConfigured({})).toBe(false);
    expect(isFirebaseWebConfigured({ ...completeEnv, VITE_FIREBASE_VAPID_KEY: "" })).toBe(false);
    expect(getFirebaseVapidKey({})).toBe("");
    expect(getFirebaseWebConfig({}).projectId).toBe("");
  });

  test("is ready when all VITE_FIREBASE_* values are present", () => {
    expect(isFirebaseWebConfigured(completeEnv)).toBe(true);
    expect(getFirebaseVapidKey(completeEnv)).toBe("vapid");
    expect(getFirebaseWebConfig(completeEnv)).toEqual({
      apiKey: "test-key",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo",
      messagingSenderId: "123",
      appId: "1:123:web:abc",
    });
  });
});
