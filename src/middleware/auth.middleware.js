import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import {User} from "../models/user_models.js"
import { asyncHandler } from "../utils/asyncHandler.js";


    export const verifyJWT = asyncHandler(async ( req,res,next)=>{

        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","")

        if(!token){
            throw new ApiError(401,"Unauthorized")
        }

        try {
        const decodedToken = jwt.verify(token,process.env.ACCESS_SECRET_TOKEN)

        const user = await User.findById(decodedToken?.id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,"Unauthorized")
        }

        req.user = user
        next()
            
        } catch (error) {

            throw new ApiError(401,"Unauthorized")
            
        }

})