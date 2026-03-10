import express from "express";
import Food from "../models/Food.js";
import Order from "../models/Order.js";

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "shopkeeper";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// POST /api/admin/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({
      success: true,
      message: "Login successful",
      token: "admin-token-" + Date.now(),
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// GET /api/admin/foods — all foods including unavailable
router.get("/foods", async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/foods/:id
router.get("/foods/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ error: "Food item not found" });
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/foods
router.post("/foods", async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/foods/:id
router.put("/foods/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!food) return res.status(404).json({ error: "Food item not found" });
    res.json(food);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/foods/:id
router.delete("/foods/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ error: "Food item not found" });
    res.json({ message: "Deleted", food });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/foods/:id/toggle-availability
router.patch("/foods/:id/toggle-availability", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ error: "Food item not found" });
    food.available = !food.available;
    await food.save();
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (req.app.get("io")) {
      req.app.get("io").emit("orderStatusUpdated", order);
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/orders/:id
router.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
