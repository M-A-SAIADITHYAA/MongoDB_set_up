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

export const User = mongoose.model("User",userSchema)