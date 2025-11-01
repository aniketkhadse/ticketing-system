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

// Root route - MUST be before other routes
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Ticketing System Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    mongodb:
      require("mongoose").connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tickets", require("./routes/tickets"));

// Test email endpoint (for debugging)
app.get("/api/test-email", async (req, res) => {
  try {
    const { sendOTPEmail } = require("./config/email");
    await sendOTPEmail("test@aristasystems.in", "123456");
    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Access at: http://0.0.0.0:${PORT}`);
});
