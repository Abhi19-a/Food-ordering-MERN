import "./env-config.js";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config.js";
import foodsRouter from "./routes/foods.js";
import ordersRouter from "./routes/orders.js";

const app = express();
const httpServer = createServer(app);

// Setup Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5000"],
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.set('io', io);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend server running successfully ✅");
});

app.use("/api/foods", foodsRouter);
app.use("/api/orders", ordersRouter);

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
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
      console.log(`🔌 Socket.IO ready for real-time notifications`);
    });
  } catch (err) {
    console.error("Failed to start server due to DB error:", err);
    process.exit(1);
  }
})();
