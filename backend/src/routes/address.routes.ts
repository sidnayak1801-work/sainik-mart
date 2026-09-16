import { Router } from "express";

import { create, list, remove, update } from "../controllers/address.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { createAddressSchema, updateAddressSchema } from "../validators/address.validators";
import { idParamSchema } from "../validators/common.validators";

const addressRouter = Router();

addressRouter.use(authenticate);

addressRouter.get("/", asyncHandler(list));
addressRouter.post("/", validate(createAddressSchema), asyncHandler(create));
addressRouter.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateAddressSchema),
  asyncHandler(update),
);
addressRouter.delete("/:id", validate(idParamSchema, "params"), asyncHandler(remove));

export default addressRouter;
