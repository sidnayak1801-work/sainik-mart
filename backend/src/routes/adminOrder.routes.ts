import { Router } from "express";

import { updateStatus } from "../controllers/order.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../validators/common.validators";
import { updateOrderStatusSchema } from "../validators/order.validators";

const adminOrderRouter = Router();

adminOrderRouter.use(authenticate, requireRole("ADMIN"));

adminOrderRouter.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(updateOrderStatusSchema),
  asyncHandler(updateStatus),
);

export default adminOrderRouter;
