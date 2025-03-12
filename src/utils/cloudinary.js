 // Configuration

 import { v2 as cloudinary } from "cloudinary";
 import dotenv from "dotenv"
 dotenv.config()

 import fs from "fs"
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localfilepath)=>{

    try {
        console.log({cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET })
        if(!localfilepath) return null
        const response = await cloudinary.uploader.upload(
            localfilepath,{
                resource_type:"auto"
            }
        )
        console.log("FILE UPLOADED "+ response.url)
        fs.unlinkSync(localfilepath)
        return response
        
    } catch (error) {
        console.log("error on cloudinary",error)
        fs.unlinkSync(localfilepath)
        return null
        
    }
}

const deleteFromCloudinary = async (publicId) =>{
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("SUCCessfullt deleted the image",result)
        
    } catch (error) {
        console.log("Error while deleting",error)
        return null
        
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}