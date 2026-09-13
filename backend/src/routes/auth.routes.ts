import { Router } from "express";

import { getCurrentUser, loginUser, registerUser } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/auth.validators";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(registerUser));
authRouter.post("/login", validate(loginSchema), asyncHandler(loginUser));
authRouter.get("/me", authenticate, asyncHandler(getCurrentUser));

export default authRouter;
