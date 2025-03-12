import express  from "express"


const app =  express()

import cors from "cors"

import cookieParser from "cookie-parser"

//CORS refers to cross origin resource sharing middleware
app.use(
    cors({
        origin:process.env.CORS_ORIGIN,//it sets the value from the .env file
        Credential:true//This option allows credentials (such as cookies, authorization headers, or TLS client certificates) to be included in cross-origin requests.
    })
)
//common middleware
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

//we will bring in routes
 
import healthcheckRouter from "./routes/healthcheck.route.js"
import userRouter  from "./routes/user.routes.js"
import { errorHandler } from "./middleware/errors.middleware.js"

//routes

app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/users",userRouter)

app.use(errorHandler)

export{app}