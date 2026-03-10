import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { sendAdminEmail } from "../middlewares/nodemailer.js";

dotenv.config();

/**
 * Razorpay instance
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * ===============================
 * CHECKOUT → CREATE ORDER
 * ===============================
 */
export const checkout = async (req, res) => {
  try {
    const uuid = req.visitorUuid;
    const { userInfo, items } = req.body;

    if (!uuid) {
      return res.status(400).json({ message: "Visitor UUID missing" });
    }

    if (!userInfo || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "User info and cart items are required" });
    }

    // 💰 Calculate total (INR → paise)
    const totalAmountInPaise =
      items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ) * 100;

    // 🧾 Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    // 🗃️ Save order in DB
    const order = await Order.create({
      uuid,
      userInfo,
      items,
      totalAmount: totalAmountInPaise / 100,
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
      userEmail: userInfo?.email,
    });

    return res.status(200).json({
      message: "Checkout successful",
      orderId: order._id,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ===============================
 * VERIFY RAZORPAY PAYMENT
 * ===============================
 */
export const verifyPayment = async (req, res) => {
  try {
    const uuid = req.visitorUuid;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // 🔐 Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Invalid payment signature" });
    }

    // 🔍 Find order
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔁 Prevent double update
    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        message: "Payment already verified",
        order,
      });
    }

    // 💳 Fetch payment from Razorpay (LIVE CHECK)
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (payment.status !== "captured") {
      return res
        .status(400)
        .json({ message: "Payment not captured" });
    }

    // ✅ Update order
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.userEmail = order.userInfo?.email;
    await order.save();

    // 🧹 Clear cart
    if (uuid) {
      await Cart.findOneAndDelete({ uuid });
    }

    // 📧 Notify admin
    await sendAdminEmail(order);

    return res.status(200).json({
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ===============================
 * GET ORDERS
 * ===============================
 */
export const getOrders = async (req, res) => {
  try {
    const { orderId } = req.params;
    const uuid = req.visitorUuid;

    // Single order by ID
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.status(200).json(order);
    }

    // Orders by UUID (user)
    if (uuid) {
      const orders = await Order.find({ uuid }).sort({
        createdAt: -1,
      });
      return res.status(200).json(orders);
    }

    // All orders (admin)
    const orders = await Order.find().sort({
      createdAt: -1,
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ===============================
 * GET ORDERS BY EMAIL (Authenticated Users)
 * ===============================
 */
export const getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const orders = await Order.find({ 
      userEmail: email.toLowerCase() 
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders by email error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ===============================
 * GET ORDERS BY USER
 * ===============================
 */
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ "userInfo.id": userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
