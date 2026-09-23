export type ProductImageSize = "card" | "detail" | "cart";

const TRANSFORMS: Record<ProductImageSize, string> = {
  card: "f_auto,q_auto,c_fill,g_auto,w_400,h_400",
  detail: "f_auto,q_auto,c_fill,g_auto,w_800,h_800",
  cart: "f_auto,q_auto,c_fill,g_auto,w_160,h_160",
};

export const cloudinaryImage = (url: string, size: ProductImageSize): string => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/${TRANSFORMS[size]}/`);
};
