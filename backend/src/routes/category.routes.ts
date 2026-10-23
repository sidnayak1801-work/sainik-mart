import { Router } from "express";

import { create, getById, list, remove, update } from "../controllers/category.controller";
import { create as createSubcategory } from "../controllers/subcategory.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate";
import { requireAdmin } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { createCategorySchema, createSubcategorySchema, updateCategorySchema } from "../validators/category.validators";
import { idParamSchema } from "../validators/common.validators";

const categoryRouter = Router();

categoryRouter.get("/", optionalAuthenticate, asyncHandler(list));
categoryRouter.post(
  "/:id/subcategories",
  authenticate,
  requireAdmin,
  validate(idParamSchema, "params"),
  validate(createSubcategorySchema),
  asyncHandler(createSubcategory),
);
categoryRouter.get("/:id", optionalAuthenticate, validate(idParamSchema, "params"), asyncHandler(getById));
categoryRouter.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createCategorySchema),
  asyncHandler(create),
);
categoryRouter.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  asyncHandler(update),
);
categoryRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validate(idParamSchema, "params"),
  asyncHandler(remove),
);

export default categoryRouter;
