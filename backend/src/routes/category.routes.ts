import { Router } from "express";

import { create, getById, list, remove, update } from "../controllers/category.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validators";
import { idParamSchema } from "../validators/common.validators";

const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(list));
categoryRouter.get("/:id", validate(idParamSchema, "params"), asyncHandler(getById));
categoryRouter.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(createCategorySchema),
  asyncHandler(create),
);
categoryRouter.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  asyncHandler(update),
);
categoryRouter.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  asyncHandler(remove),
);

export default categoryRouter;
