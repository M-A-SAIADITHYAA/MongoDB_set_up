import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB = async() => {
    try{
        console.log(process
            .env.usernam)
        
        const username = "user";
        
        const password = encodeURIComponent(process.env.password);
        const cluster = process.env.cluster;
        const connectionString = `mongodb+srv://${username}:${password}@${cluster}`;
        const connectionInstance = await mongoose.connect(connectionString);
        
        console.log(`\nmongo connected\n${connectionInstance.connection.host}`)
    }catch(error){
        // console.log("MongoDB URI:", process.env.MONGODB_URL);
        const username = encodeURIComponent(process.env.usernam);
        
        const password = encodeURIComponent(process.env.password);
        console.log(username)
        // console.log(password)
        console.log("HI")
        console.log("MongoDB error 12",error)
        process.exit(1)
    }
}

export default connectDB