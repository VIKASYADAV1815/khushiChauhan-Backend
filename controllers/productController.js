import fs from "fs";
import Product from "../models/Product.js";
import cloudinary from "../libs/cloudinary.js";

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const parseArrayField = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // no-op cleanup
  }
};

const extractCloudinaryPublicId = (assetUrl) => {
  if (!assetUrl || typeof assetUrl !== "string") return null;

  try {
    const parsed = new URL(assetUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);

    const uploadIndex = parts.findIndex((part) => part === "upload");
    if (uploadIndex === -1) return null;

    let publicParts = parts.slice(uploadIndex + 1);
    if (!publicParts.length) return null;

    // Drop optional version segment like v1700000000.
    if (/^v\d+$/.test(publicParts[0])) {
      publicParts = publicParts.slice(1);
    }

    if (!publicParts.length) return null;

    const last = publicParts[publicParts.length - 1];
    publicParts[publicParts.length - 1] = last.replace(/\.[^.]+$/, "");

    return publicParts.join("/");
  } catch {
    return null;
  }
};

const getCloudinaryResourceType = (assetUrl) => {
  if (!assetUrl || typeof assetUrl !== "string") return "image";
  return assetUrl.includes("/video/upload/") ? "video" : "image";
};

const deleteCloudinaryAssetByUrl = async (assetUrl) => {
  const publicId = extractCloudinaryPublicId(assetUrl);
  if (!publicId) return;

  const resourceType = getCloudinaryResourceType(assetUrl);
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

  if (result?.result !== "ok" && result?.result !== "not found") {
    throw new Error(`Cloudinary deletion failed for ${publicId}`);
  }
};

const uploadToCloudinary = async (filePath, resourceType, folder) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: resourceType,
    folder,
  });

  await safeUnlink(filePath);
  return result.secure_url;
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    if (!hasCloudinaryConfig()) {
      return res.status(500).json({
        message:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      });
    }

    const imageFiles = req.files?.images || [];
    const videoFile = req.files?.video?.[0];

    if (!req.body.name || !req.body.slug || !req.body.category) {
      return res
        .status(400)
        .json({ message: "name, slug, and category are required" });
    }

    if (!imageFiles.length) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const existing = await Product.findOne({ slug: req.body.slug.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Product with this slug already exists" });
    }

    const uploadedImages = [];
    for (const file of imageFiles) {
      const url = await uploadToCloudinary(file.path, "image", "khushi/products/images");
      uploadedImages.push(url);
    }

    let uploadedVideo = req.body.video || "";
    if (videoFile) {
      uploadedVideo = await uploadToCloudinary(
        videoFile.path,
        "video",
        "khushi/products/videos"
      );
    }

    const details = parseArrayField(req.body.details, []);
    const product = await Product.create({
      id: req.body.id || req.body.slug,
      slug: req.body.slug,
      name: req.body.name,
      tagline: req.body.tagline || "",
      price: toNumber(req.body.price, 0),
      category: req.body.category,
      subCategory: req.body.subCategory || "",
      image: uploadedImages[0] || "",
      images: uploadedImages,
      video: uploadedVideo,
      description: req.body.description || "",
      details,
      stock: toNumber(req.body.stock, 0),
      minStockLevel: toNumber(req.body.minStockLevel, 5),
      notes: req.body.notes || "",
    });

    return res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!hasCloudinaryConfig()) {
      return res.status(500).json({
        message:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      });
    }

    const { id } = req.params;
    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageFiles = req.files?.images || [];
    const videoFile = req.files?.video?.[0];

    const existingImages = parseArrayField(req.body.existingImages, product.images || []);
    const uploadedImages = [];

    for (const file of imageFiles) {
      const url = await uploadToCloudinary(file.path, "image", "khushi/products/images");
      uploadedImages.push(url);
    }

    const nextImages = [...existingImages, ...uploadedImages].filter(Boolean);
    if (!nextImages.length) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const removedImageUrls = Array.from(
      new Set([...(product.images || []), ...(product.image ? [product.image] : [])])
    ).filter((url) => !nextImages.includes(url));

    let nextVideo = req.body.video ?? product.video;
    let replacedVideoUrl = "";
    if (videoFile) {
      nextVideo = await uploadToCloudinary(
        videoFile.path,
        "video",
        "khushi/products/videos"
      );
      if (product.video && product.video !== nextVideo) {
        replacedVideoUrl = product.video;
      }
    }

    const nextSlug = (req.body.slug || product.slug).toLowerCase();
    if (nextSlug !== product.slug) {
      const duplicate = await Product.findOne({ slug: nextSlug, _id: { $ne: product._id } });
      if (duplicate) {
        return res.status(409).json({ message: "Another product with this slug already exists" });
      }
    }

    const updated = await Product.findByIdAndUpdate(
      product._id,
      {
        id: req.body.id || nextSlug,
        slug: nextSlug,
        name: req.body.name ?? product.name,
        tagline: req.body.tagline ?? product.tagline,
        price: toNumber(req.body.price, product.price),
        category: req.body.category ?? product.category,
        subCategory: req.body.subCategory ?? product.subCategory,
        image: nextImages[0] || "",
        images: nextImages,
        video: nextVideo || "",
        description: req.body.description ?? product.description,
        details: parseArrayField(req.body.details, product.details || []),
        stock: toNumber(req.body.stock, product.stock),
        minStockLevel: toNumber(req.body.minStockLevel, product.minStockLevel),
        notes: req.body.notes ?? product.notes,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Best-effort cleanup for media removed during edit.
    for (const url of removedImageUrls) {
      try {
        await deleteCloudinaryAssetByUrl(url);
      } catch (cleanupError) {
        console.warn("Image cleanup warning:", cleanupError?.message || cleanupError);
      }
    }

    if (replacedVideoUrl) {
      try {
        await deleteCloudinaryAssetByUrl(replacedVideoUrl);
      } catch (cleanupError) {
        console.warn("Video cleanup warning:", cleanupError?.message || cleanupError);
      }
    }

    return res.status(200).json({ message: "Product updated", product: updated });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (hasCloudinaryConfig()) {
      const imageUrls = Array.isArray(product.images) ? product.images : [];
      const allImageUrls = new Set([...(product.image ? [product.image] : []), ...imageUrls]);

      for (const url of allImageUrls) {
        await deleteCloudinaryAssetByUrl(url);
      }

      if (product.video) {
        await deleteCloudinaryAssetByUrl(product.video);
      }
    }

    await Product.deleteOne({ _id: product._id });

    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
