import { Router } from "express";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  requestOtpCode,
  verifyOtpCode,
} from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { loginSchema, otpRequestSchema, otpVerifySchema, registerSchema } from "../validators/auth.validators";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(registerUser));
authRouter.post("/login", validate(loginSchema), asyncHandler(loginUser));
authRouter.post("/otp/request", validate(otpRequestSchema), asyncHandler(requestOtpCode));
authRouter.post("/otp/verify", validate(otpVerifySchema), asyncHandler(verifyOtpCode));
authRouter.get("/me", authenticate, asyncHandler(getCurrentUser));

export default authRouter;
