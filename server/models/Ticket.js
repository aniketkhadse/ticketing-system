const mongoose = require("mongoose");
const { getNextSequence } = require("./Counter");

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  authorType: {
    type: String,
    enum: ["user", "admin"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  folderPath: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "solved", "error"],
    default: "pending",
  },
  adminComment: {
    type: String,
    default: "",
  },
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate ticket ID using counter (prevents race conditions)
ticketSchema.pre("save", async function (next) {
  try {
    if (this.isNew && !this.ticketId) {
      const seq = await getNextSequence("ticketId");
      this.ticketId = `TKT-${String(seq).padStart(6, "0")}`;
    }
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    console.error("Error generating ticket ID:", error);
    next(error);
  }
});

module.exports = mongoose.model("Ticket", ticketSchema);
