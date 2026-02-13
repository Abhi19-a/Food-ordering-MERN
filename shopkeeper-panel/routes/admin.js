import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Import Food model from main backend
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: String,
    description: String,
    available: { type: Boolean, default: true }
}, { timestamps: true });

const Food = mongoose.model('Food', foodSchema);

// Simple authentication middleware (hardcoded for now)
const ADMIN_USERNAME = 'shopkeeper';
const ADMIN_PASSWORD = 'admin123';

// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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

// Get all food items
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
