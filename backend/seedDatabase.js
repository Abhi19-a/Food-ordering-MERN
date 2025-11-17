// backend/seedDatabase.js
import mongoose from 'mongoose';
import Food from './models/Food.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodcourt';

// Image URLs for different food categories
const foodImages = {
  'Veg Items': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
  'Non-Veg Items': 'https://images.unsplash.com/photo-1504674900247-087703934569?q=80&w=800&auto=format&fit=crop',
  'Combo Packs': 'https://images.unsplash.com/photo-1504674900247-087703934569?q=80&w=800&auto=format&fit=crop',
  'Juices': 'https://images.unsplash.com/photo-1551024601-bec78aea704c?q=80&w=800&auto=format&fit=crop',
  'Milkshakes': 'https://images.unsplash.com/photo-1577805947697-1e6ef734513f?q=80&w=800&auto=format&fit=crop',
  'Ice Creams': 'https://images.unsplash.com/photo-1560008581-98ca82856190?q=80&w=800&auto=format&fit=crop',
  'Chat Items': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop'
};

const foodItems = [
  // 🥗 VEG ITEMS
  { 
    name: 'Paneer Roll', 
    price: 50, 
    category: 'Veg Items',
    imageUrl: '/images/paneer-roll.jpg'
  },
  { 
    name: 'Maggi', 
    price: 30, 
    category: 'Veg Items',
    imageUrl: '/images/maggi.jpg'
  },
  { 
    name: 'Cheese Maggi', 
    price: 40, 
    category: 'Veg Items',
    imageUrl: '/images/cheese-maggi.jpg'
  },
  { 
    name: 'French Fries', 
    price: 40, 
    category: 'Veg Items',
    imageUrl: '/images/french-fries.jpg'
  },
  { 
    name: 'Peri Peri French Fries', 
    price: 50, 
    category: 'Veg Items',
    imageUrl: '/images/peri-peri-french-fries.jpg'
  },
  { 
    name: 'French Fries with Cheese', 
    price: 60, 
    category: 'Veg Items',
    imageUrl: '/images/French Fries with Cheese.jpg'
  },
  { 
    name: 'Missel Pav', 
    price: 40, 
    category: 'Veg Items',
    imageUrl: '/images/Missel Pav.jpg'
  },
  { 
    name: 'Masala Dosa', 
    price: 50, 
    category: 'Veg Items',
    imageUrl: '/images/masala-dosa.jpg'
  },
  { name: 'Veg Burger', price: 60, category: 'Veg Items' },
  { name: 'Chapathi Kurma', price: 35, category: 'Veg Items' },
  { name: 'Idli Vada', price: 40, category: 'Veg Items' },
  { name: 'Plain Dosa', price: 40, category: 'Veg Items' },
  { name: 'Set Dosa', price: 40, category: 'Veg Items' },
  { name: 'Masala Dosa', price: 50, category: 'Veg Items' },
  { name: 'Tuppa Dosa', price: 50, category: 'Veg Items' },
  { name: 'Onion Dosa', price: 50, category: 'Veg Items' },
  { name: 'Puri Baji', price: 40, category: 'Veg Items' },
  { name: 'Buns', price: 30, category: 'Veg Items' },
  { name: 'Pulav', price: 30, category: 'Veg Items' },
  { name: 'Schezwan Masala Dosa', price: 50, category: 'Veg Items' },
  { name: 'Onion Pakoda', price: 30, category: 'Veg Items' },
  { name: 'Parota Kurma', price: 35, category: 'Veg Items' },
  { name: 'Dahi Vada', price: 40, category: 'Veg Items' },
  { name: 'Veg Cutlet', price: 30, category: 'Veg Items' },
  { name: 'Gobi Pav', price: 15, category: 'Veg Items' },
  { name: 'Vada Pav', price: 15, category: 'Veg Items' },
  { name: 'Samosa Pav', price: 20, category: 'Veg Items' },
  { name: 'Gobi Manchurian', price: 70, category: 'Veg Items' },
  { name: 'Gobi Chilli', price: 80, category: 'Veg Items' },
  { name: 'Paneer Manchurian', price: 90, category: 'Veg Items' },
  { name: 'Paneer Chilli', price: 90, category: 'Veg Items' },
  { name: 'Veg Fried Rice', price: 40, category: 'Veg Items' },
  { name: 'Veg Noodles', price: 40, category: 'Veg Items' },
  { name: 'Paneer M Fried Rice', price: 70, category: 'Veg Items' },
  { name: 'Paneer M Noodles', price: 70, category: 'Veg Items' },
  { name: 'Veg Pulav', price: 40, category: 'Veg Items' },
  { name: 'Gobi Noodles', price: 40, category: 'Veg Items' },
  { name: 'Veg Schezwan Rice', price: 80, category: 'Veg Items' },
  { name: 'Veg Schezwan Noodles', price: 80, category: 'Veg Items' },
  { name: 'Gobi Rice', price: 40, category: 'Veg Items' },
  { name: 'Curd Rice', price: 50, category: 'Veg Items' },

  // NON-VEG ITEMS
  { 
    name: 'Chicken Gravy Parota', 
    price: 60, 
    category: 'Non-Veg Items',
    imageUrl: '/images/chicken-gravy-parota.png'
  },
  { name: 'Egg Gravy Parota', price: 50, category: 'Non-Veg Items' },
  { name: 'Kabab (1Pc)', price: 35, category: 'Non-Veg Items' },
  { 
    name: 'Chicken Roll', 
    price: 60, 
    category: 'Non-Veg Items',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop'
  },
  { name: 'Boiled Egg', price: 10, category: 'Non-Veg Items' },
  { name: 'Tandoori Kabab (1Pc)', price: 40, category: 'Non-Veg Items' },
  { name: 'Chicken Sausage', price: 40, category: 'Non-Veg Items' },
  { name: 'Chicken Nuggets', price: 40, category: 'Non-Veg Items' },
  { name: 'Chicken Burger', price: 50, category: 'Non-Veg Items' },
  { name: 'Egg Maggi', price: 40, category: 'Non-Veg Items' },
  { name: 'Bread Omelet', price: 20, category: 'Non-Veg Items' },
  { name: 'Egg Pav', price: 15, category: 'Non-Veg Items' },
  { name: 'Chicken Chilli', price: 100, category: 'Non-Veg Items' },
  { name: 'Chicken Manchurian', price: 100, category: 'Non-Veg Items' },
  { name: 'Pepper Chicken', price: 100, category: 'Non-Veg Items' },
  { 
    name: 'Chicken Biryani', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/chicken-biryani.jpg'
  },
  { name: 'Kori Rotti', price: 100, category: 'Non-Veg Items' },
  { name: 'Chicken Fried Rice', price: 80, category: 'Non-Veg Items' },
  { name: 'Chicken Noodles', price: 80, category: 'Non-Veg Items' },
  { name: 'Chicken M Fried Rice', price: 100, category: 'Non-Veg Items' },
  { name: 'Chicken M Noodles', price: 100, category: 'Non-Veg Items' },
  { name: 'Egg Fried Rice', price: 60, category: 'Non-Veg Items' },
  { name: 'Egg Noodles', price: 60, category: 'Non-Veg Items' },
  { name: 'Pepper Chicken Rice', price: 100, category: 'Non-Veg Items' },
  { name: 'Schezwan C Rice', price: 100, category: 'Non-Veg Items' },
  { name: 'Schezwan C Noodles', price: 100, category: 'Non-Veg Items' },
  { name: 'Tripple C Fried Rice', price: 100, category: 'Non-Veg Items' },
  { name: 'Tripple C Noodles', price: 100, category: 'Non-Veg Items' },

  // COMBO PACKS
  { name: 'C. Biryani + Kabab (2Pc) + Coke', price: 150, category: 'Combo Packs' },
  { name: 'C. Burger + French Fries + Coke', price: 100, category: 'Combo Packs' },
  { name: 'C. Burger + French Fries + Cheese + Coke', price: 120, category: 'Combo Packs' },
  { 
    name: 'Veg Meals', 
    price: 80, 
    category: 'Combo Packs',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop'
  },
  { name: 'Veg Burger + French Fries + Cheese + Coke', price: 120, category: 'Combo Packs' },
  { name: 'Veg Burger + French Fries + Coke', price: 100, category: 'Combo Packs' },
  { name: 'Paneer Roll + Coke', price: 80, category: 'Combo Packs' },
  { name: 'Chicken Roll + Coke', price: 80, category: 'Combo Packs' },

  // JUICES
  { name: 'Lime Juice', price: 20, category: 'Juices & Beverages' },
  { name: 'Lime Soda', price: 20, category: 'Juices & Beverages' },
  { name: 'Lime Ginger', price: 25, category: 'Juices & Beverages' },
  { name: 'Yellu (Sesame)', price: 30, category: 'Juices & Beverages' },
  { name: 'Lassi', price: 30, category: 'Juices & Beverages' },
  { name: 'Musambi', price: 30, category: 'Juices & Beverages' },
  { name: 'Orange', price: 30, category: 'Juices & Beverages' },
  { name: 'Pineapple', price: 30, category: 'Juices & Beverages' },
  { name: 'Watermelon', price: 30, category: 'Juices & Beverages' },
  { name: 'Grapes', price: 30, category: 'Juices & Beverages' },
  { name: 'Fruit Bowl', price: 40, category: 'Juices & Beverages' },
  { name: 'Mixed Fruit', price: 40, category: 'Juices & Beverages' },
  { name: 'Musk Melon', price: 40, category: 'Juices & Beverages' },
  { name: 'Pomegranate', price: 40, category: 'Juices & Beverages' },
  { name: 'Green Apple', price: 40, category: 'Juices & Beverages' },
  { name: 'Blue Ocean', price: 60, category: 'Juices & Beverages' },
  { name: 'Carrot Juice', price: 35, category: 'Juices & Beverages' },
  { 
    name: 'Mango Juice', 
    price: 40, 
    category: 'Juices',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704c?q=80&w=800&auto=format&fit=crop'
  },
  { name: 'Tutty Fruity', price: 40, category: 'Juices & Beverages' },
  { name: 'Pundi Gasi', price: 30, category: 'Juices & Beverages' },

  // MILKSHAKES
  { name: 'Apple Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Banana Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Chikku Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Strawberry Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Cold Horlicks', price: 70, category: 'Milkshakes' },
  { name: 'Cold Coffee', price: 70, category: 'Milkshakes' },
  { 
    name: 'Chocolate Milkshake', 
    price: 60, 
    category: 'Milkshakes',
    imageUrl: 'https://images.unsplash.com/photo-1577805947697-1e6ef734513f?q=80&w=800&auto=format&fit=crop'
  },
  { name: 'Avil Milk', price: 70, category: 'Milkshakes' },
  { name: 'Sharjah Shake', price: 80, category: 'Milkshakes' },
  { name: 'Butter Scotch Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Vanilla Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Guava Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Oreo Milkshake', price: 80, category: 'Milkshakes' },
  { name: 'Rose Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Pista Milkshake', price: 70, category: 'Milkshakes' },
  { name: 'Mango Milkshake', price: 80, category: 'Milkshakes' },
  { name: 'Malpe Milkshake', price: 80, category: 'Milkshakes' },
  { name: 'Belgian Dark Chocolate', price: 80, category: 'Milkshakes' },
  { name: 'English Toffee', price: 80, category: 'Milkshakes' },
  { name: 'Coke Floating', price: 60, category: 'Milkshakes' },
  { name: 'Mint Mojito', price: 70, category: 'Milkshakes' },
  { name: 'Chilli Guava Squash', price: 70, category: 'Milkshakes' },
  { name: 'Masala Lemonade', price: 70, category: 'Milkshakes' },
  { name: 'Imli Banta', price: 60, category: 'Milkshakes' },
  { name: 'Tangy Mango Twist', price: 70, category: 'Milkshakes' },

  // ICE CREAMS
  { name: 'Gudbud', price: 50, category: 'Ice Creams' },
  { name: 'Dilkush', price: 50, category: 'Ice Creams' },
  { name: 'Pinklady', price: 40, category: 'Ice Creams' },
  { name: 'Rose Fatooda', price: 50, category: 'Ice Creams' },
  { name: 'Fruit Salad', price: 50, category: 'Ice Creams' },
  { name: 'Butterscotch Icecream', price: 40, category: 'Ice Creams' },
  { 
    name: 'Vanilla Ice Cream', 
    price: 40, 
    category: 'Ice Creams',
    imageUrl: 'https://images.unsplash.com/photo-1560008581-98ca82856190?q=80&w=800&auto=format&fit=crop'
  },
  { name: 'Pista Icecream', price: 40, category: 'Ice Creams' },
  { name: 'Mango Icecream', price: 40, category: 'Ice Creams' },
  { name: 'Chocolate Icecream', price: 40, category: 'Ice Creams' },
  { name: 'Strawberry Icecream', price: 40, category: 'Ice Creams' },
  { name: 'Blackcurrant', price: 40, category: 'Ice Creams' },
  { name: 'Anjeer', price: 50, category: 'Ice Creams' },

  // CHAT ITEMS
  { name: 'Masala Poori', price: 45, category: 'Chat Items' },
  { 
    name: 'Pani Puri', 
    price: 30, 
    category: 'Chat Items',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop'
  },
  { name: 'Sev Poori', price: 45, category: 'Chat Items' },
  { name: 'Bel Poori', price: 45, category: 'Chat Items' },
  { name: 'Dahi Poori', price: 50, category: 'Chat Items' },
  { name: 'Pav Bhaji', price: 50, category: 'Chat Items' },
  { name: 'Paneer Pav Bhaji', price: 60, category: 'Chat Items' }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Food.deleteMany({});
    console.log('Cleared existing food items');

    // Add a default image URL for any items that might not have a specific image
    const foodWithImages = foodItems.map(item => ({
      ...item,
      imageUrl: item.imageUrl || foodImages[item.category] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'
    }));

    try {
      await Food.deleteMany({});
      await Food.insertMany(foodWithImages);
      console.log('Database seeded successfully with images!');
      console.log('Total items added:', foodWithImages.length);
      process.exit(0);
    } catch (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
