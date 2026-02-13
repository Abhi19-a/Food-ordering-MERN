import dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env' });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foodcourt';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        console.log('📦 Database:', mongoose.connection.db.databaseName);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// API Routes
app.use('/api/admin', adminRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.ADMIN_PORT || 5000;

app.listen(PORT, () => {
    console.log(`🏪 Shopkeeper Panel running on http://localhost:${PORT}`);
});
