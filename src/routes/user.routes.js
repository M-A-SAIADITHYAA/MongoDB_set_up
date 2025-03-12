import { Router } from "express";

import {registered_user} from "../controller/user.controllers.js"

import {upload} from "../middleware/multer.middlewares.js"

const router = Router()

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1

    }
]),registered_user)

export default router