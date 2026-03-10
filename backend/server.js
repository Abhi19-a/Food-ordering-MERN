import "./env-config.js";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config.js";
import foodsRouter from "./routes/foods.js";
import ordersRouter from "./routes/orders.js";
import adminRouter from "./routes/admin.js";

const app = express();
const httpServer = createServer(app);

// Setup Socket.IO with CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5000",
  "http://10.111.16.25:5173",
  "http://10.111.16.25:5000",
  // Add your production URLs here after deployment:
  // "https://your-frontend.vercel.app",
  // "https://your-shopkeeper-panel.vercel.app"
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin?.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

// Make io accessible in routes
app.set('io', io);

// CORS middleware for Express
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin?.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend server running successfully ✅");
});

app.use("/api/foods", foodsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('👋 Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;

// Immediately-invoked async function to connect DB first, then start server
(async () => {
  try {
    await connectDB(); // <-- wait for DB connection (so its logs appear)
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server started on port ${PORT}`);
      console.log(`🌐 Local: http://localhost:${PORT}`);
      console.log(`🌐 Network: http://10.111.16.25:${PORT}`);
      console.log(`🔌 Socket.IO ready for real-time notifications`);
    });
  } catch (err) {
    console.error("Failed to start server due to DB error:", err);
    process.exit(1);
  }
})();
