import { Router } from "express";

import addressRouter from "./address.routes";
import adminOrderRouter from "./adminOrder.routes";
import apiHealthRouter from "./apiHealth.routes";
import authRouter from "./auth.routes";
import cartRouter from "./cart.routes";
import categoryRouter from "./category.routes";
import healthRouter from "./health.routes";
import orderRouter from "./order.routes";
import productRouter from "./product.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/api/health", apiHealthRouter);
apiRouter.use("/api/auth", authRouter);
apiRouter.use("/api/categories", categoryRouter);
apiRouter.use("/api/products", productRouter);
apiRouter.use("/api/cart", cartRouter);
apiRouter.use("/api/addresses", addressRouter);
apiRouter.use("/api/orders", orderRouter);
apiRouter.use("/api/admin/orders", adminOrderRouter);

export default apiRouter;
