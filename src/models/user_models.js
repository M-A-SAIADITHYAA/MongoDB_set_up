// id string pk
// username string
// email string
// fullName string
// avatar string
// coverImage string
// watchHistory[] Object
// password string
// refreshToken string
// createdAt Date
// updatedAt Date

//mongodb will automatical add id for a primary key

import mongoose,{Schema, Types} from "mongoose";
import bcrypt from "bcrypt"

import jwt from "jsonwebtoken"
const userSchema = new Schema(

    {
        username:{
            type:true,
            required:true,
            unique: true,
            lowercase:true,
            trim: true,
            index: trim


        },
        email: {
            type :String,
            trim : true,
            required : true,
            lowercase: true,
            index : true
        },
        fullname:{
            type:String,
            required : true,
            trim: true,
            index:true,


        },
        avatar:{
            type:String,
            require:true
        },

        coverImage: {
            type :String,
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },

        password:{
            type: String,
            requied : [true,"PASSWORD IS REQUIRED"]
        },

        refreshToken: {
            type:String,
        }



    }
    ,
        {timestamps: true}
)

userSchema.pre("Save",async function (next){

    if(!this.modified("password")) return next()
    this.password = bcrypt.hash(this.password,10)
    next()


})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function (){

    jwt.sign({
        _id : this._id,
        email : this.email,
        username: this.username,
        fullname : this.fullname,
    },process.env.ACCESS_SECRET_TOKEN,{expiresIn:process.env.EXPIRY_TIME})

}

userSchema.methods.generateRefreshToken = function (){

    jwt.sign({
        _id : this._id,
        
    },process.env.REFRESH_SECRET_TOKEN,{expiresIn:process.env.REFRESH_EXPIRY_TIME})

}

export const User = mongoose.model("User",userSchema)