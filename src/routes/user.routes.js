import { Router } from "express";

import {registered_user,loggoutUser} from "../controller/user.controllers.js"

import {upload} from "../middleware/multer.middlewares.js"
import { verifyJWT } from "jsonwebtoken";

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

router.route("/logout").post(verifyJWT,loggoutUser) // verifyJWT is the middleware after completing the next points to the loggoutUser

export default router