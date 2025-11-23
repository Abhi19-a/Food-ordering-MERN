import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: String,
    description: String,
    imageUrl: String,
  },
  { timestamps: true }
);

// Create slug from name before saving
FoodSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/\s+/g, '-')      // Replace spaces with -
      .replace(/-+/g, '-')       // Replace multiple - with single -
      .trim();
  }
  next();
});

export default mongoose.model("Food", FoodSchema);
