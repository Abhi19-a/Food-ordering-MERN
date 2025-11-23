import express from "express";
import Food from "../models/Food.js";

const router = express.Router();

// GET /api/foods  (supports ?category=Veg)
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const foods = await Food.find(filter).sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/foods/categories
router.get("/categories", async (req, res) => {
  try {
    const cats = await Food.distinct("category");
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/foods/slug/:slug - Get food by slug (must come before /:id)
router.get("/slug/:slug", async (req, res) => {
  try {
    const food = await Food.findOne({ slug: req.params.slug });
    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/foods/:id - Get food by ID
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST create food
router.post("/", async (req, res) => {
  try {
    const food = new Food(req.body);
    const saved = await food.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const updated = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

// PATCH /api/foods/fix-missing-prices: Set a default price if missing
router.patch("/fix-missing-prices", async (req, res) => {
  const defaultPrice = 30;
  try {
    const result = await Food.updateMany(
      { $or: [{ price: { $exists: false } }, { price: null }] },
      { $set: { price: defaultPrice } }
    );
    res.json({ fixedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fix missing prices" });
  }
});

export default router;
