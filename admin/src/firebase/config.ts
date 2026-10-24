export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
};

type FirebaseEnv = {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_VAPID_KEY?: string;
};

const trim = (value: string | undefined): string => value?.trim() ?? "";

const readEnv = (): FirebaseEnv => import.meta.env;

export const getFirebaseWebConfig = (env: FirebaseEnv = readEnv()): FirebaseWebConfig => ({
  apiKey: trim(env.VITE_FIREBASE_API_KEY),
  authDomain: trim(env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: trim(env.VITE_FIREBASE_PROJECT_ID),
  messagingSenderId: trim(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: trim(env.VITE_FIREBASE_APP_ID),
});

export const getFirebaseVapidKey = (env: FirebaseEnv = readEnv()): string => trim(env.VITE_FIREBASE_VAPID_KEY);

export const isFirebaseWebConfigured = (env: FirebaseEnv = readEnv()): boolean => {
  const config = getFirebaseWebConfig(env);
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId &&
      getFirebaseVapidKey(env),
  );
};
