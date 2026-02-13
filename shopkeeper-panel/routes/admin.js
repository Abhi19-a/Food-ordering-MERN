import express from 'express';
import mongoose from 'mongoose';
import { adminConfig } from '../config/credentials.js';

const router = express.Router();

// Use the same Food schema as backend (with slug + available)
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: String,
    description: String,
    imageUrl: String,
    available: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-generate slug from name before saving
foodSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

// Avoid recompiling model if it already exists
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === adminConfig.username && password === adminConfig.password) {
        res.json({
            success: true,
            message: 'Login successful',
            token: 'admin-token-' + Date.now()
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// Get all food items (admin sees ALL including unavailable)
router.get('/foods', async (req, res) => {
    try {
        const foods = await Food.find().sort({ createdAt: -1 });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single food item
router.get('/foods/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json(food);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new food item
router.post('/foods', async (req, res) => {
    try {
        const food = new Food(req.body);
        await food.save();
        res.status(201).json(food);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update food item
router.put('/foods/:id', async (req, res) => {
    try {
        const food = await Food.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json(food);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete food item
router.delete('/foods/:id', async (req, res) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json({ message: 'Food item deleted successfully', food });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle availability
router.patch('/foods/:id/toggle-availability', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        food.available = !food.available;
        await food.save();
        res.json(food);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
