import { Router } from "express";

import { remove, update } from "../controllers/subcategory.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { updateSubcategorySchema } from "../validators/category.validators";
import { idParamSchema } from "../validators/common.validators";

const subcategoryRouter = Router();

subcategoryRouter.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validate(idParamSchema, "params"),
  validate(updateSubcategorySchema),
  asyncHandler(update),
);
subcategoryRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validate(idParamSchema, "params"),
  asyncHandler(remove),
);

export default subcategoryRouter;
