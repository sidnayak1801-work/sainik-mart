import { Router } from "express";

import { getApiHealth } from "../controllers/health.controller";

const apiHealthRouter = Router();

apiHealthRouter.get("/", getApiHealth);

export default apiHealthRouter;
