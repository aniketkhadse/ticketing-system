const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendNewTicketEmail, sendTicketStatusEmail } = require('../config/email');

// Create Ticket (User)
// Create Ticket (User)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { folderPath, query } = req.body;

    // Generate ticketId manually
    const count = await Ticket.countDocuments();
    const ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;

    const ticket = new Ticket({
      ticketId,  // Add this line
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      folderPath,
      query,
    });

    await ticket.save();

    // Send email to admin
    await sendNewTicketEmail(process.env.ADMIN_EMAIL, {
      ticketId: ticket.ticketId,
      userName: ticket.userName,
      userEmail: ticket.userEmail,
      folderPath: ticket.folderPath,
      query: ticket.query,
    });

    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Failed to create ticket', error: error.message });
  }
});

// Get User's Tickets
router.get('/my-tickets', authMiddleware, async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;

    let query = { userId: req.user._id };

    if (filter && filter !== 'all') {
      if (filter === 'solved') {
        query.status = 'solved';
      } else if (filter === 'unsolved') {
        query.status = { $in: ['pending', 'error'] };
      } else if (filter === 'error') {
        query.status = 'error';
      }
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let tickets = await Ticket.find(query).sort({ createdAt: -1 });

    // Apply sorting
    if (req.query.sort === 'oldest') {
      tickets = tickets.reverse();
    }

    res.json({ tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

// Get All Tickets (Admin)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;

    let query = {};

    if (filter && filter !== 'all') {
      if (filter === 'solved') {
        query.status = 'solved';
      } else if (filter === 'unsolved') {
        query.status = { $in: ['pending', 'error'] };
      } else if (filter === 'error') {
        query.status = 'error';
      }
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let tickets = await Ticket.find(query).sort({ createdAt: -1 });

    if (req.query.sort === 'oldest') {
      tickets = tickets.reverse();
    }

    res.json({ tickets });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

// Update Ticket Status (Admin)
router.patch('/:ticketId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, adminComment } = req.body;

    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    if (adminComment) {
      ticket.adminComment = adminComment;
    }
    await ticket.save();

    // Send email to user if status changed to solved or error
    if (oldStatus !== status && (status === 'solved' || status === 'error')) {
      await sendTicketStatusEmail(ticket.userEmail, {
        ticketId: ticket.ticketId,
        folderPath: ticket.folderPath,
        status: ticket.status,
        adminComment: ticket.adminComment,
      });
    }

    res.json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Failed to update ticket', error: error.message });
  }
});

// Add Comment to Ticket
router.post('/:ticketId/comments', authMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text } = req.body;

    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const comment = {
      text,
      author: req.user.isAdmin ? 'Admin' : req.user.name,
      authorType: req.user.isAdmin ? 'admin' : 'user',
    };

    ticket.comments.push(comment);
    await ticket.save();

    res.json({ message: 'Comment added successfully', ticket });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

module.exports = router;