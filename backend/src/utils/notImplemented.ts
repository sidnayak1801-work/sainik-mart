import { AppError } from "./AppError";

export const notImplemented = (feature: string): never => {
  throw new AppError(`${feature} is not implemented yet`, 501);
};
