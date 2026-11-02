import { appConfig, isHttpsUrl, type DistributionMode } from "../config/appConfig";
import type { DeviceKind } from "./device";

export type InstallIntent =
  | { kind: "download"; url: string }
  | { kind: "playstore"; url: string }
  | { kind: "coming_soon" }
  | { kind: "ios" }
  | { kind: "desktop"; qrUrl: string };

export const hasApkDownload = (url: string = appConfig.androidApkUrl): boolean => isHttpsUrl(url);

export const hasPlayStoreListing = (
  mode: DistributionMode = appConfig.distributionMode,
  url: string = appConfig.playStoreUrl,
): boolean => mode === "playstore" && isHttpsUrl(url);

export const isSameOriginApk = (url: string, origin = window.location.origin): boolean => {
  try {
    const parsed = new URL(url, origin);
    return parsed.origin === origin && parsed.pathname.toLowerCase().endsWith(".apk");
  } catch {
    return false;
  }
};

export const resolveInstallIntent = (
  device: DeviceKind,
  config = appConfig,
): InstallIntent => {
  if (device === "ios") {
    return { kind: "ios" };
  }

  const playReady = hasPlayStoreListing(config.distributionMode, config.playStoreUrl);
  const apkReady = hasApkDownload(config.androidApkUrl);

  if (playReady) {
    return { kind: "playstore", url: config.playStoreUrl };
  }

  if (apkReady) {
    return { kind: "download", url: config.androidApkUrl };
  }

  if (device === "desktop") {
    return {
      kind: "desktop",
      qrUrl: config.siteUrl,
    };
  }

  return { kind: "coming_soon" };
};
