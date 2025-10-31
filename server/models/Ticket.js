const mongoose = require('mongoose');

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
    enum: ['user', 'admin'],
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
    ref: 'User',
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
    enum: ['pending', 'solved', 'error'],
    default: 'pending',
  },
  adminComment: {
    type: String,
    default: '',
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

// Auto-generate ticket ID
// Auto-generate ticket ID
ticketSchema.pre('save', async function (next) {
  try {
    if (this.isNew && !this.ticketId) {
      const Ticket = this.constructor;
      const count = await Ticket.countDocuments();
      this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
    }
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);