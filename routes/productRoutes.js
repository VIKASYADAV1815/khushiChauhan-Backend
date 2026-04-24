import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { uploadProductMedia } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", uploadProductMedia, createProduct);
router.put("/:id", uploadProductMedia, updateProduct);
router.delete("/:id", deleteProduct);

export default router;
