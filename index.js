import dotenv from 'dotenv';
dotenv.config(); // MUST be the first thing

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // <-- added
import connectDB from './libs/db.js';
import cartRoutes from './routes/cartRoutes.js'; // <-- added
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import { generateUuid } from './middlewares/generateUuid.js'; // <-- added

const app = express();

// Middlewares
// Origin list can include Render domain and later custom domains
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  process.env.FRONTEND_URL_WWW,
  "http://localhost:3000",
  "https://khushichauhandesignerstudio.com",
  "https://www.khushichauhandesignerstudio.com"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list or is a subdomain of our main domain
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith(".khushichauhandesignerstudio.com") ||
                     origin.includes("localhost");

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS: ", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser()); // <-- needed to read cookies

// Connect to MongoDB
connectDB();

// ensure token secret is configured
if (!process.env.TOKEN_SECRET) {
  console.warn('WARNING: TOKEN_SECRET not set; using insecure default. Set TOKEN_SECRET in your environment!');
}

// visitor middlewares 
app.use(generateUuid)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);


// Health route (Render)
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Basic routes for category pages so they don't 404
app.get("/lehenga", (req, res) => {
  res.send("Lehenga route is working");
});

app.get("/drape", (req, res) => {
  res.send("Drape route is working");
});


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
