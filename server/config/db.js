const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    console.log("✅ MongoDB Connected Successfully");
    console.log("📊 Database:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Full error:", error);
    // Don't exit in production, let Railway restart
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});

module.exports = connectDB;
