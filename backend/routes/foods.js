import express from "express";
import Food from "../models/Food.js";

const router = express.Router();

// GET all foods
router.get("/", async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
});

// POST create food
router.post("/", async (req, res) => {
  const food = new Food(req.body);
  const saved = await food.save();
  res.status(201).json(saved);
});

// PUT update
router.put("/:id", async (req, res) => {
  const updated = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Food.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

export default router;
