const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ticketing-system-cyan.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tickets", require("./routes/tickets"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Test email endpoint
app.get("/api/test-email", async (req, res) => {
  try {
    const { sendOTPEmail } = require("./config/email");
    await sendOTPEmail("test@aristasystems.in", "123456");
    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
