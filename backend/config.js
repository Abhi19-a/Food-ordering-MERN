// backend/config.js
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/foodcourt";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected Successfully");
    console.log("Mongo host:", conn.connection.host);
    console.log("Mongo port:", conn.connection.port);
    console.log("Mongo name:", conn.connection.name);
  } catch (err) {
    console.error("MongoDB connection failed — full error below:");
    console.error(err);
    throw err; // throw so server startup can catch it
  }
};

export default connectDB;
