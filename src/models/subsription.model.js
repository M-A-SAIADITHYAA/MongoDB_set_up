import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    //one who is subscibing

    channel:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    //is the one who u r  subscribing
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)