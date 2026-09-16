import { Router } from "express";

import { create, getById, list, remove, update } from "../controllers/product.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../validators/common.validators";
import { createProductSchema, updateProductSchema } from "../validators/product.validators";

const productRouter = Router();

productRouter.get("/", asyncHandler(list));
productRouter.get("/:id", validate(idParamSchema, "params"), asyncHandler(getById));
productRouter.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(createProductSchema),
  asyncHandler(create),
);
productRouter.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateProductSchema),
  asyncHandler(update),
);
productRouter.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  asyncHandler(remove),
);

export default productRouter;
