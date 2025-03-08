import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const  healthchecker = asyncHandler(async (req,res)=>{
   return res.status(200).json(new ApiResponse(200,"ok","Health check passed"))

})

export {healthchecker}
    

