import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: String,
    description: String,
    imageUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("Food", FoodSchema);
