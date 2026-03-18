import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tagline: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    image: { type: String, required: true },
    isOutOfStock: { type: Boolean, default: false },
    images: { type: [String] },
    video: { type: String },
    description: { type: String },
    details: { type: [String] },
    studio: {
      name: { type: String },
      address: { type: String },
      landmark: { type: String },
    },
  },
  {
    timestamps: true,
    collection: "Products",
  }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
