import express from "express";
import {
  sendOTP,
  verifyOTP,
  sendForgotPasswordOTP,
  resetPassword,
  signup,
  login,
  markEmailVerified,
  debugCheckUser,
} from "../controllers/authController.js";

const router = express.Router();

// Signup and Login
router.post("/signup", signup);                 // Create new user account
router.post("/login", login);                   // Login user

// OTP for signup
router.post("/send-otp", sendOTP);              // Send OTP for email verification
router.post("/verify-otp", verifyOTP);          // Verify OTP for signup
router.post("/mark-email-verified", markEmailVerified); // Mark email as verified after OTP

// OTP for forgot password
router.post("/forgot-password", sendForgotPasswordOTP);  // Send OTP for password reset
router.post("/reset-password", resetPassword);           // Verify OTP and reset password

// Debug endpoint
router.post("/debug-check-user", debugCheckUser);        // Check if user exists in DB

export default router;
