import { Router } from "express";

import { addItem, get, removeItem, updateItem } from "../controllers/cart.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cart.validators";
import { idParamSchema } from "../validators/common.validators";

const cartRouter = Router();

cartRouter.use(authenticate);

cartRouter.get("/", asyncHandler(get));
cartRouter.post("/items", validate(addCartItemSchema), asyncHandler(addItem));
cartRouter.patch(
  "/items/:id",
  validate(idParamSchema, "params"),
  validate(updateCartItemSchema),
  asyncHandler(updateItem),
);
cartRouter.delete("/items/:id", validate(idParamSchema, "params"), asyncHandler(removeItem));

export default cartRouter;
