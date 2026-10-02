import { Router } from "express";

import { checkoutPage, verify } from "../controllers/payment.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { checkoutPageQuerySchema, verifyPaymentSchema } from "../validators/payment.validators";

const paymentRouter = Router();

paymentRouter.get("/checkout", validate(checkoutPageQuerySchema, "query"), checkoutPage);

paymentRouter.use(authenticate);

paymentRouter.post("/verify", validate(verifyPaymentSchema), asyncHandler(verify));

export default paymentRouter;
