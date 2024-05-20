import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async() => {
    try {
        const connectioInstinct = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDb is connceted!!  Host: ${connectioInstinct.connection.host}`);
    } catch (error) {
        console.log("ERROR: ",error);
        process.exit(1)
    }
}

export default connectDb