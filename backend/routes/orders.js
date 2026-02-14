import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// GET all orders (for admin)
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET single order by ID
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// POST create new order
router.post("/", async (req, res) => {
    try {
        const order = new Order(req.body);
        const saved = await order.save();

        // Emit socket event for real-time notification
        if (req.app.get('io')) {
            req.app.get('io').emit('newOrder', saved);
        }

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: "Invalid data", details: err.message });
    }
});

// PATCH update order status
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Emit socket event for status update
        if (req.app.get('io')) {
            req.app.get('io').emit('orderStatusUpdated', order);
        }

        res.json(order);
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});

// DELETE order
router.delete("/:id", async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ msg: "Deleted" });
    } catch (err) {
        res.status(400).json({ error: "Delete failed" });
    }
});

export default router;
