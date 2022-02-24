import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    image: { type: String },
    name: { type: String },
    price: { type: String },
    category: { type: String },
    countInStock: { type: Number, default: 1 },
    description: { type: String },
    cloudinary_id: { type: String },
    comments: [],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
