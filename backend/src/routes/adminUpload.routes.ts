import { Router } from "express";

import { create } from "../controllers/upload.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireRole";
import { uploadImage } from "../middleware/uploadImage";

const adminUploadRouter = Router();

adminUploadRouter.use(authenticate, requireAdmin);
adminUploadRouter.post("/", uploadImage, asyncHandler(create));

export default adminUploadRouter;
