export type DeviceKind = "android" | "ios" | "desktop";

export const detectDevice = (userAgent = navigator.userAgent): DeviceKind => {
  if (/android/i.test(userAgent)) {
    return "android";
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "ios";
  }

  return "desktop";
};
