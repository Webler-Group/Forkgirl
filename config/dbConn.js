import mongoose from "mongoose";
import { config } from "../config.js";

const connectDB = async () => {
    await mongoose.connect(config.databaseUri);
    console.log("Connected to database succcessfully!");
}

export default connectDB;