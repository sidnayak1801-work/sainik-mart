import { appConfig, isHttpsUrl, type DistributionMode } from "../config/appConfig";
import type { DeviceKind } from "./device";

export type InstallIntent =
  | { kind: "download"; url: string }
  | { kind: "playstore"; url: string }
  | { kind: "coming_soon" }
  | { kind: "ios" }
  | { kind: "desktop"; qrUrl: string };

export const hasApkDownload = (
  mode: DistributionMode = appConfig.distributionMode,
  url: string = appConfig.androidApkUrl,
): boolean => mode === "apk" && isHttpsUrl(url);

export const hasPlayStoreListing = (
  mode: DistributionMode = appConfig.distributionMode,
  url: string = appConfig.playStoreUrl,
): boolean => mode === "playstore" && isHttpsUrl(url);

export const resolveInstallIntent = (
  device: DeviceKind,
  config = appConfig,
): InstallIntent => {
  if (device === "ios") {
    return { kind: "ios" };
  }

  const apkReady = hasApkDownload(config.distributionMode, config.androidApkUrl);
  const playReady = hasPlayStoreListing(config.distributionMode, config.playStoreUrl);

  if (device === "desktop") {
    return {
      kind: "desktop",
      qrUrl: playReady ? config.playStoreUrl : config.siteUrl,
    };
  }

  if (apkReady) {
    return { kind: "download", url: config.androidApkUrl };
  }

  if (playReady) {
    return { kind: "playstore", url: config.playStoreUrl };
  }

  return { kind: "coming_soon" };
};

export const startApkDownload = (url: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "sainik-mart.apk");
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
};
