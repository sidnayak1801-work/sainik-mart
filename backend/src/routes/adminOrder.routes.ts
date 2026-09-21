import { Router } from "express";

import { updateStatus } from "../controllers/order.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../validators/common.validators";
import { updateOrderStatusSchema } from "../validators/order.validators";

const adminOrderRouter = Router();

adminOrderRouter.use(authenticate, requireAdmin);

adminOrderRouter.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(updateOrderStatusSchema),
  asyncHandler(updateStatus),
);

export default adminOrderRouter;
