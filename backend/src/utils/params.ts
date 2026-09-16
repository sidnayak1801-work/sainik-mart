import { AppError } from "./AppError";

export const paramId = (value: string | string[] | undefined): string => {
  if (typeof value !== "string") {
    throw new AppError("Invalid id", 400);
  }
  return value;
};
