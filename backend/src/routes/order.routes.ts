import { Router } from "express";

import { cancel, create, getById, list } from "../controllers/order.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../validators/common.validators";
import { createOrderSchema, orderListQuerySchema } from "../validators/order.validators";

const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post("/", validate(createOrderSchema), asyncHandler(create));
orderRouter.get("/", validate(orderListQuerySchema, "query"), asyncHandler(list));
orderRouter.get("/:id", validate(idParamSchema, "params"), asyncHandler(getById));
orderRouter.post("/:id/cancel", validate(idParamSchema, "params"), asyncHandler(cancel));

export default orderRouter;
