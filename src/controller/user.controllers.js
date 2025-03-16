import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"

import {User} from "../models/user_models.js"
import { ApiResponse } from "../utils/Apiresponse.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


import jwt from "jsonwebtoken"
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

const generateAccessandRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId)
    
        if(!user){
            throw new ApiError(400,"User not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong with refreshToken ")
        
    }
}

const loginUser = asyncHandler(async (req,res)=>{
    //get the data from the body
    const {email,username,password} = req.body

    if(!email){
        throw new ApiError(500,"email is required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(500,"User not found")
    }

    const isPassworValid  = await user.isPasswordCorrect(password)
    if(!isPassworValid){{
        throw new ApiError(500,"Invalid credentials")
    }}

    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id)
    const loggedInUser = await User.findById
    (user._id).select(
        "-password -refreshToken"
    )

    if(!loggedInUser){
        throw new ApiError(500,"user not found in database")
    }

    const options = {
        httpOnly : true,
        secure: process.env.NODE_ENV === "production",

    }

    return res
    .status(200) 
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,
        {user:loggedInUser,refreshToken,accessToken},
        "User logged in successfully"))
    
})

const refreshAccessToken = asyncHandler( async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken ||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh token is needed")
    }

    try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_SECRET_TOKEN
            )

            const user = await User.findById(decodedToken?._id)

            if(!user){
                throw new ApiError(401,"Invalid refreshTokne")
            }

            if(user?.refreshToken!==incomingRefreshToken){
                throw new ApiError(401,"Invalid Refresh Token ")
            }

            const options = {
                httpOnly:true,
                secure:process.env.NODE_ENV==="production"
            }

           const {accessToken,refreshToken:newRefreshToken} = await generateAccessandRefreshToken(user._id)

           return res.cookie("accessToken",accessToken,options).
           cookie("refreshToken",newRefreshToken,options).
           json(
              new ApiError(200,
            {accessToken,
                
                refreshToken:newRefreshToken},
            "Access token refreshed successfully"
        )).

           status(200)
    } catch (error) {
        throw new ApiError(500,"Something went wrong with refreshAccessToken")
        
    }
})

const loggoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:
            {
                refreshToken:undefined,
            }
        },
        {new:true}
    )

    const options = {
        httpOnly:true,
        secure:process.env.NODE_ENV==="production"

    }
    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out successfully"))
})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
   
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
     

    if(!isPasswordValid){
        throw new ApiError(401,"Password is not correct")
    }
    user.password = newPassword

    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{

    return res.status(200).json(new ApiResponse(200,req.user,"Current user default"))
    
})

const updateAccountDetails = asyncHandler(async(req,res)=>{

    const {fullname,email} = req.body

    if(!fullname || !email){
        throw new ApiError(400,"Fullname and email are required")
    }

    const userdetails = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email : email
            }
        },
        {
            new:true
        }.select("-password")
    )

    return res.status(200).json( new ApiResponse(200,userdetails,"Updated successfully"))
    
})

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.files?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Give the image please")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(500,"Something went wrong while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.usr?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200,user,"Successfully changed the avatar picture"))
    
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.files?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"NO coverimage path ")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError(400,"something went wrong")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {new:true}
    ).select("-password -refresToken")

    return res.status(200).json(new ApiResponse(200,user,
    "Successfully changed"
    ))
    
})

export {
    registered_user,
    loginUser,
    refreshAccessToken,
    loggoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserCoverImage,
    updateUserAvatar
}