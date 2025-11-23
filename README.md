# Food Ordering MERN
My first MERN CRUD food ordering project 🍔

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Clerk account (for authentication) - [Sign up for free](https://clerk.com)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example` if it exists):
   ```env
   MONGO_URI=mongodb://localhost:27017/foodcourt
   PORT=4000
   ```
   - For MongoDB Atlas, replace `MONGO_URI` with your connection string
   - Default port is 4000

4. Make sure MongoDB is running locally, or update `MONGO_URI` to your MongoDB Atlas connection string

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example` if it exists):
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   VITE_API_URL=http://localhost:4000
   VITE_API_BASE=http://localhost:4000
   ```
   - Get your Clerk publishable key from [Clerk Dashboard](https://dashboard.clerk.com)
   - Make sure `VITE_API_URL` matches your backend port (default: 4000)

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will typically run on `http://localhost:5173` (Vite default)

### Database Seeding (Optional)

If you want to seed the database with sample data:
```bash
cd backend
node seedDatabase.js
```

### Project Structure
- `backend/` - Express.js API server with MongoDB
- `frontend/` - React + Vite frontend with Clerk authentication
- Backend runs on port 4000
- Frontend runs on port 5173 (Vite default)

### Features
- 🍔 Food ordering system
- 🔐 User authentication with Clerk
- 🛒 Shopping cart functionality
- 📱 Responsive design
- 🎨 Modern UI with React

### Tech Stack
- **Frontend**: React, Vite, React Router, Clerk, React Toastify
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Database**: MongoDB