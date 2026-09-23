import { v2 as cloudinary } from "cloudinary";

import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export type UploadedImage = {
  url: string;
  publicId: string;
};

type UploadFn = (buffer: Buffer) => Promise<UploadedImage>;

const isConfigured = (): boolean => {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
};

const uploadToCloudinary: UploadFn = async (buffer) => {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  return new Promise<UploadedImage>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sainik-mart/products",
        resource_type: "image",
        transformation: [{ width: 1600, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(new AppError("Unable to upload image", 502));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

let uploader: UploadFn | null = null;

export const setUploadImplementation = (fn: UploadFn | null): void => {
  uploader = fn;
};

export const uploadProductImage = async (buffer: Buffer): Promise<UploadedImage> => {
  if (uploader) {
    return uploader(buffer);
  }
  if (!isConfigured()) {
    throw new AppError("Image upload is not configured", 501);
  }
  return uploadToCloudinary(buffer);
};
