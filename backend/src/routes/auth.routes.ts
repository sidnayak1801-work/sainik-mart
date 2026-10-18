import { Router } from "express";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resendOtpCode,
  sendOtpCode,
  verifyOtpCode,
  verifyWidgetToken,
} from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { otpIpLimit } from "../middleware/otpIpLimit";
import { validate } from "../middleware/validate";
import {
  loginSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  verifyWidgetSchema,
} from "../validators/auth.validators";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(registerUser));
authRouter.post("/login", validate(loginSchema), asyncHandler(loginUser));
authRouter.post("/send-otp", otpIpLimit, validate(sendOtpSchema), asyncHandler(sendOtpCode));
authRouter.post("/resend-otp", otpIpLimit, validate(sendOtpSchema), asyncHandler(resendOtpCode));
authRouter.post("/verify-otp", otpIpLimit, validate(verifyOtpSchema), asyncHandler(verifyOtpCode));
authRouter.post("/verify-widget", otpIpLimit, validate(verifyWidgetSchema), asyncHandler(verifyWidgetToken));
authRouter.post("/logout", asyncHandler(logoutUser));
authRouter.get("/me", authenticate, asyncHandler(getCurrentUser));

export default authRouter;
