import express from "express";
import {
  addCart,
  getCart,
  updateCartItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Add/update cart
router.post("/", addCart);

// Get cart
router.get("/", getCart);

// Update item quantity
router.put("/:itemId", updateCartItem);

// Clear cart
router.delete("/", clearCart);

export default router;
