/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_DISTRIBUTION_MODE?: string;
  readonly VITE_ANDROID_APK_URL?: string;
  readonly VITE_PLAY_STORE_URL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_DOWNLOAD_LABEL?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_CONTACT_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
