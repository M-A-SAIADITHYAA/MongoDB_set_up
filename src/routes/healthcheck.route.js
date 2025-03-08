import { Router } from "express";

import { healthchecker } from "../controller/healthCheckController.js";

const router = Router()

router.route("/").get(healthchecker)

export default router