import { Router } from "express";

import { registerToken, removeToken } from "../controllers/notification.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { registerDeviceTokenSchema, removeDeviceTokenSchema } from "../validators/notification.validators";

const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.post("/device-token", validate(registerDeviceTokenSchema), asyncHandler(registerToken));
notificationRouter.delete("/device-token", validate(removeDeviceTokenSchema), asyncHandler(removeToken));

export default notificationRouter;
