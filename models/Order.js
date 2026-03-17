import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // Link order to visitor/cart
    uuid: {
      type: String,
      required: true,
      index: true,
    },

    // Customer delivery info
    userInfo: {
      id: { type: String }, // optional user ID
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String }, // optional
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    // Cart snapshot at time of order
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
      },
    ],

    // Final amount in INR
    totalAmount: {
      type: Number,
      required: true,
    },

    // Payment lifecycle
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // Razorpay references
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    // Link to authenticated user (email)
    userEmail: {
      type: String,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: "Orders",
  }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
