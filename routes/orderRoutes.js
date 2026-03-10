import express from "express";
import { checkout, verifyPayment, getOrders, getOrdersByEmail, getOrdersByUser } from "../controllers/orderController.js";

const router = express.Router();

// 1️⃣ Create Razorpay order + save order in DB
router.post("/checkout", checkout);

// 2️⃣ Verify Razorpay payment
router.post("/verify", verifyPayment);

// 3️⃣ Get orders by email (for authenticated users)
router.get("/by-email/:email", getOrdersByEmail);

// 4️⃣ Get orders
router.get("/", getOrders);           // Get all orders or orders by UUID (visitor)
router.get("/:orderId", getOrders);   // Get single order by ID

// Get orders by user ID
router.get("/user/:userId", getOrdersByUser);

export default router;
