import type { ApiSuccess } from "@/types/auth";

import { api } from "./client";

export type UploadedImage = {
  url: string;
  publicId: string;
};

export const uploadImage = async (file: File): Promise<UploadedImage> => {
  const form = new FormData();
  form.append("file", file);
  const response = await api.postForm<ApiSuccess<UploadedImage>>("/api/admin/uploads", form);
  return response.data;
};
