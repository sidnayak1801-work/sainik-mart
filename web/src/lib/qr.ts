export const createQrDataUrl = async (value: string): Promise<string> => {
  const { toDataURL } = await import("qrcode");
  return toDataURL(value, {
    width: 220,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: "#0C3F24",
      light: "#FFFFFF",
    },
  });
};
