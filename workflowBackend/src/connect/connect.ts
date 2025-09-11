import mongoose from "mongoose"

export default async function connectToDatabase() {
    try{
        await mongoose.connect(process.env.MONGO_URL as string)
        console.log("Connected to DB")
    }catch(e){
        if (e instanceof Error) {
            console.log("Error at connecting to mongoDb:", e.message)
        } else {
            console.log("An unexpected error occurred:", e)
        }
    }
}