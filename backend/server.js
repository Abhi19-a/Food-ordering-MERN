import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config.js";
import foodsRouter from "./routes/foods.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend server running successfully ✅");
});

app.use("/api/foods", foodsRouter);

const PORT = process.env.PORT || 4000;

// Immediately-invoked async function to connect DB first, then start server
(async () => {
  try {
    await connectDB(); // <-- wait for DB connection (so its logs appear)
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server due to DB error:", err);
    process.exit(1);
  }
})();
