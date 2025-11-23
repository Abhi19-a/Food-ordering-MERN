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
  'Juices & Beverages': 'https://images.unsplash.com/photo-1551024601-bec78aea704c?q=80&w=800&auto=format&fit=crop',
  'Milkshakes': 'https://images.unsplash.com/photo-1577805947697-1e6ef734513f?q=80&w=800&auto=format&fit=crop',
  'Ice Creams': 'https://images.unsplash.com/photo-1560008581-98ca82856190?q=80&w=800&auto=format&fit=crop',
  'Chat Items': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop'
};

// Local image assets stored in frontend/public/images
const localImageMap = {
  'buns': '/images/Buns.jpg',
  'chapathi-kurma': '/images/Chapathi Kurma.jpg',
  'dahi-vada': '/images/Dahi Vada.jpg',
  'french-fries-with-cheese': '/images/French Fries with Cheese.jpg',
  'idli-vada': '/images/Idli Vada.jpg',
  'missel-pav': '/images/Missel Pav.jpg',
  'onion-dosa': '/images/Onion Dosa.jpg',
  'onion-pakoda': '/images/Onion Pakoda.jpg',
  'parota-kurma': '/images/Parota Kurma.jpg',
  'plain-dosa': '/images/Plain Dosa.jpg',
  'pulav': '/images/Pulav.jpg',
  'puri-baji': '/images/Puri Baji.jpg',
  'schezwan-masala-dosa': '/images/Schezwan Masala Dosa.jpg',
  'set-dosa': '/images/Set Dosa.jpg',
  'tuppa-dosa': '/images/Tuppa Dosa.jpg',
  'veg-burger': '/images/Veg Burger.jpg',
  'veg-cutlet': '/images/Veg Cutlet.jpg',
  'paneer-roll': '/images/paneer-roll.jpg',
  'maggi': '/images/maggi.jpg',
  'cheese-maggi': '/images/cheese-maggi.jpg',
  'french-fries': '/images/french-fries.jpg',
  'peri-peri-french-fries': '/images/peri-peri-french-fries.jpg',
  'masala-dosa': '/images/masala-dosa.jpg',
  'chicken-biryani': '/images/chicken-biryani.jpg',
  'chicken-gravy-parota': '/images/chicken-gravy-parota.png'
};

const toSlug = (value = '') => value
  .toString()
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

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
  { name: 'Veg Burger', price: 60, category: 'Veg Items', imageUrl: '/images/Veg Burger.jpg' },
  { name: 'Chapathi Kurma', price: 35, category: 'Veg Items', imageUrl: '/images/Chapathi Kurma.jpg' },
  { name: 'Idli Vada', price: 40, category: 'Veg Items', imageUrl: '/images/Idli Vada.jpg' },
  { name: 'Plain Dosa', price: 40, category: 'Veg Items', imageUrl: '/images/Plain Dosa.jpg' },
  { name: 'Set Dosa', price: 40, category: 'Veg Items', imageUrl: '/images/Set Dosa.jpg' },
  { name: 'Tuppa Dosa', price: 50, category: 'Veg Items', imageUrl: '/images/Tuppa Dosa.jpg' },
  { name: 'Onion Dosa', price: 50, category: 'Veg Items', imageUrl: '/images/Onion Dosa.jpg' },
  { name: 'Puri Baji', price: 40, category: 'Veg Items', imageUrl: '/images/Puri Baji.jpg' },
  { name: 'Buns', price: 30, category: 'Veg Items', imageUrl: '/images/Buns.jpg' },
  { name: 'Pulav', price: 30, category: 'Veg Items', imageUrl: '/images/Pulav.jpg' },
  { name: 'Schezwan Masala Dosa', price: 50, category: 'Veg Items', imageUrl: '/images/Schezwan Masala Dosa.jpg' },
  { name: 'Onion Pakoda', price: 30, category: 'Veg Items', imageUrl: '/images/Onion Pakoda.jpg' },
  { name: 'Parota Kurma', price: 35, category: 'Veg Items', imageUrl: '/images/Parota Kurma.jpg' },
  { name: 'Dahi Vada', price: 40, category: 'Veg Items', imageUrl: '/images/Dahi Vada.jpg' },
  { name: 'Veg Cutlet', price: 30, category: 'Veg Items', imageUrl: '/images/Veg Cutlet.jpg' },
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
  { 
    name: 'Egg Gravy Parota', 
    price: 50, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Egg Gravy Parota.jpg'
  },
  { 
    name: 'Kabab (1Pc)', 
    price: 35, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Tandoori Kabab (1Pc).jpg'
  },
  { 
    name: 'Chicken Roll', 
    price: 60, 
    category: 'Non-Veg Items',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop'
  },
  { 
    name: 'Boiled Egg', 
    price: 10, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Boiled Egg.jpg'
  },
  { 
    name: 'Tandoori Kabab (1Pc)', 
    price: 40, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Tandoori Kabab (1Pc).jpg'
  },
  { 
    name: 'Chicken Sausage', 
    price: 40, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken Sausage.jpg'
  },
  { 
    name: 'Chicken Nuggets', 
    price: 40, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken Nuggets.jpg'
  },
  { 
    name: 'Chicken Burger', 
    price: 50, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken Burger.jpg'
  },
  { 
    name: 'Egg Maggi', 
    price: 40, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Egg Maggi.jpg'
  },
  { 
    name: 'Bread Omelet', 
    price: 20, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Bread Omelet.jpg'
  },
  { 
    name: 'Egg Pav', 
    price: 15, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Egg Pav.jpg'
  },
  { 
    name: 'Chicken Chilli', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken Chilli.jpg'
  },
  { 
    name: 'Chicken Manchurian', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken Manchurian.jpg'
  },
  { 
    name: 'Pepper Chicken', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Pepper Chicken.jpg'
  },
  { 
    name: 'Chicken Biryani', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/chicken-biryani.jpg'
  },
  { 
    name: 'Kori Rotti', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Kori Rotti.jpg'
  },
  { 
    name: 'Chicken Fried Rice', 
    price: 80, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken Fried Rice.jpg'
  },
  { 
    name: 'Chicken Noodles', 
    price: 80, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken Noodles.jpg'
  },
  { 
    name: 'Chicken M Fried Rice', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken M Fried Rice.jpg'
  },
  { 
    name: 'Chicken M Noodles', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Chicken M Noodles.jpg'
  },
  { 
    name: 'Egg Fried Rice', 
    price: 60, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Egg Fried Rice.jpg'
  },
  { 
    name: 'Egg Noodles', 
    price: 60, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Egg Noodles.jpg'
  },
  { 
    name: 'Pepper Chicken Rice', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Pepper Chicken Rice.jpg'
  },
  { 
    name: 'Schezwan C Rice', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Schezwan C Rice.jpg'
  },
  { 
    name: 'Schezwan C Noodles', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Schezwan C Noodles.jpg'
  },
  { 
    name: 'Tripple C Fried Rice', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Tripple C Fried Rice.jpg'
  },
  { 
    name: 'Tripple C Noodles', 
    price: 100, 
    category: 'Non-Veg Items',
    imageUrl: '/images/Tripple C Noodles.jpg'
  },

  // COMBO PACKS
  { 
    name: 'C. Biryani + Kabab (2Pc) + Coke', 
    price: 150, 
    category: 'Combo Packs',
    imageUrl: '/images/C. Biryani + Kabab (2Pc) + Coke.jpeg'
  },
  { 
    name: 'C. Burger + French Fries + Coke', 
    price: 100, 
    category: 'Combo Packs',
    imageUrl: '/images/C. Burger + French Fries + Coke.jpeg'
  },
  { 
    name: 'C. Burger + French Fries + Cheese + Coke', 
    price: 120, 
    category: 'Combo Packs',
    imageUrl: '/images/C. Burger + French Fries + Cheese + Coke.jpeg'
  },
  { 
    name: 'Veg Meals', 
    price: 80, 
    category: 'Combo Packs',
    imageUrl: '/images/Veg Meals.jpeg'
  },
  { 
    name: 'Veg Burger + French Fries + Cheese + Coke', 
    price: 120, 
    category: 'Combo Packs',
    imageUrl: '/images/Veg Burger + French Fries + Cheese + Coke.jpeg'
  },
  { 
    name: 'Veg Burger + French Fries + Coke', 
    price: 100, 
    category: 'Combo Packs',
    imageUrl: '/images/Veg Burger + French Fries + Coke.jpeg'
  },
  { 
    name: 'Paneer Roll + Coke', 
    price: 80, 
    category: 'Combo Packs',
    imageUrl: '/images/Paneer Roll + Coke.jpeg'
  },
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
    category: 'Juices & Beverages',
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
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Food.deleteMany({});
    console.log('Cleared existing food items');

    // Add a default image URL for any items that might not have a specific image
    // Also generate slugs since insertMany doesn't trigger pre-save hooks
    const foodWithImages = foodItems.map(item => {
      const slug = toSlug(item.name);
      const resolvedImage = item.imageUrl || localImageMap[slug] || foodImages[item.category] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop';
      return {
        ...item,
        slug: slug, // Explicitly set slug since insertMany doesn't trigger pre-save hooks
        imageUrl: resolvedImage
      };
    });

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
