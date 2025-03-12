import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";


const errorHandler = (err,req,res,next)=>{
    let error= err

    if(!(error instanceof ApiError)){
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 :500
        const message  = error.message || "Something went wrong"
        console.log({cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET })
        console.log("hi")

        error = new ApiError(statusCode,message,error?.errors || [],err.stack)

    }

    const response = {
        ...error,//destructure the code
        message:    error.message,
            ...(process.env.NODE_ENV === "development"?{stack:error.stack}:{})
    }

    return res.status(error.statusCode).json(response)

}

export{errorHandler}