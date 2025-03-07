import express  from "express"

const app =  express()

import cors from "cors"
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


export{app}