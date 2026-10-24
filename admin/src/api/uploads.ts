import type { ApiSuccess } from "@/types/auth";

import { ApiError, api } from "./client";

export type UploadedImage = {
  url: string;
  publicId: string;
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const assertUploadableImage = (file: File): void => {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ApiError("Image must be a JPEG, PNG, or WebP file", 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError("Image must be 5 MB or smaller", 400);
  }
};

export const uploadImage = async (file: File): Promise<UploadedImage> => {
  assertUploadableImage(file);
  const form = new FormData();
  form.append("file", file);
  const response = await api.postForm<ApiSuccess<UploadedImage>>("/api/admin/uploads", form);
  return response.data;
};
