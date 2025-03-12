import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"

import {User} from "../models/user_models.js"
import { ApiResponse } from "../utils/Apiresponse.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
const registered_user =  asyncHandler(async(req,res)=>{

    const {fullname,email,username,password} = req.body
    console.log("email  12",email)
    console.log(fullname)
    console.log(username)
    console.log(password)

    //
    if(
        [fullname,email,username,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"The full name is empty")
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Username already Exist")
    }

    console.warn(req.files)

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar files is missing")
    }
   
    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // let coverimage = ""

    // if(coverImageLocalPath){
    //  coverimage = await uploadOnCloudinary(coverImageLocalPath)
    // }

    let avatar ;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Uploaded avatar",avatar)
        
    } catch (error) {
        console.log("error uploading in uploading")
        throw new Error(500,"Failed to upload avatar")

        
    }

    
    let coverImage ;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
        console.log("Uploaded coverImage",avatar)
        
    } catch (error) {
        console.log("error uploading in uploading",error)
        throw new Error(500,"Failed to upload coverImage")

        
    }

    try {
        const user = await User.create({
            fullname,
            avatar:avatar.url,
            coverimage:coverImage?.url|| "",
            email,
            password,
            username:username.toLowerCase()
     // ?. is called optional Chaining
    
        
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createdUser){
            throw new Error(500,"Something went wrong while registering user")
        }
    
        return res
        .status(202)
        .json(new ApiResponse(200,createdUser,"SUCCESS CREATED"))
    
        
    
    } catch (error) {
        console
 .log("User creation failed ")

 if(avatar){
    await deleteFromCloudinary(avatar.public_id)
 }
 if(coverImage){
    await deleteFromCloudinary(coverImage.public_id)
 }
 throw new Error(500,"Something went wrong while registering user and images are deleted form the cloludinary")

        
    }
})

export {
    registered_user,
}