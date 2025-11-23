// backend/migrateJuicesCategory.js
// Script to merge 'Juices' category into 'Juices & Beverages'
import mongoose from 'mongoose';
import Food from './models/Food.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodcourt';

const migrateJuicesCategory = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all items with category 'Juices' to 'Juices & Beverages'
    const result = await Food.updateMany(
      { category: 'Juices' },
      { $set: { category: 'Juices & Beverages' } }
    );

    console.log(`Migration completed! Updated ${result.modifiedCount} items from 'Juices' to 'Juices & Beverages'`);
    
    // Also handle any case variations
    const result2 = await Food.updateMany(
      { category: { $regex: /^juices$/i } },
      { $set: { category: 'Juices & Beverages' } }
    );

    if (result2.modifiedCount > 0) {
      console.log(`Also updated ${result2.modifiedCount} items with case variations`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error migrating categories:', error);
    process.exit(1);
  }
};

// Run the migration
migrateJuicesCategory();

