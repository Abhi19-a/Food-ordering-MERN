import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// simple test route
app.get("/", (req, res) => {
  res.send("Backend server running successfully ✅");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
