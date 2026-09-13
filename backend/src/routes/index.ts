import { Router } from "express";

import authRouter from "./auth.routes";
import healthRouter from "./health.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/api/auth", authRouter);

export default apiRouter;
