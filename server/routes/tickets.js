const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const {
  sendNewTicketEmail,
  sendTicketStatusEmail,
} = require("../config/email");

// Create Ticket (User) - FIXED: Removed duplicate ticketId generation
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { folderPath, query } = req.body;

    console.log("📝 Creating new ticket for user:", req.user.email);

    // Let the model's pre-save hook generate the ticketId
    const ticket = new Ticket({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      folderPath,
      query,
    });

    await ticket.save();
    console.log("✅ Ticket created:", ticket.ticketId);

    // Send email to admin (don't fail if email fails)
    try {
      await sendNewTicketEmail(process.env.ADMIN_EMAIL, {
        ticketId: ticket.ticketId,
        userName: ticket.userName,
        userEmail: ticket.userEmail,
        folderPath: ticket.folderPath,
        query: ticket.query,
      });
      console.log("✅ Admin notification email sent");
    } catch (emailError) {
      console.error("⚠️ Failed to send admin email:", emailError.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("❌ Create ticket error:", error);
    res.status(500).json({
      message: "Failed to create ticket",
      error: error.message,
    });
  }
});

// Get User's Tickets
router.get("/my-tickets", authMiddleware, async (req, res) => {
  try {
    const { filter, startDate, endDate, sort } = req.query;

    console.log("📋 Fetching tickets for user:", req.user.email);

    let query = { userId: req.user._id };

    // Apply status filter
    if (filter && filter !== "all") {
      if (filter === "solved") {
        query.status = "solved";
      } else if (filter === "unsolved") {
        query.status = { $in: ["pending", "error"] };
      } else if (filter === "error") {
        query.status = "error";
      }
    }

    // Apply date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Fetch and sort tickets
    const sortOrder = sort === "oldest" ? 1 : -1;
    const tickets = await Ticket.find(query).sort({ createdAt: sortOrder });

    console.log(`✅ Found ${tickets.length} tickets`);

    res.json({ tickets });
  } catch (error) {
    console.error("❌ Get tickets error:", error);
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
});

// Get All Tickets (Admin)
router.get("/admin/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { filter, startDate, endDate, sort } = req.query;

    console.log("📋 Admin fetching all tickets");

    let query = {};

    // Apply status filter
    if (filter && filter !== "all") {
      if (filter === "solved") {
        query.status = "solved";
      } else if (filter === "unsolved") {
        query.status = { $in: ["pending", "error"] };
      } else if (filter === "error") {
        query.status = "error";
      }
    }

    // Apply date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Fetch and sort tickets
    const sortOrder = sort === "oldest" ? 1 : -1;
    const tickets = await Ticket.find(query).sort({ createdAt: sortOrder });

    console.log(`✅ Found ${tickets.length} tickets`);

    res.json({ tickets });
  } catch (error) {
    console.error("❌ Get all tickets error:", error);
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
});

// Update Ticket Status (Admin)
router.patch(
  "/:ticketId/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { status, adminComment } = req.body;

      console.log("🔄 Updating ticket status:", ticketId, "to", status);

      const ticket = await Ticket.findOne({ ticketId });
      if (!ticket) {
        console.log("❌ Ticket not found:", ticketId);
        return res.status(404).json({ message: "Ticket not found" });
      }

      const oldStatus = ticket.status;
      ticket.status = status;
      if (adminComment) {
        ticket.adminComment = adminComment;
      }
      await ticket.save();

      console.log("✅ Ticket status updated");

      // Send email to user if status changed to solved or error
      if (oldStatus !== status && (status === "solved" || status === "error")) {
        try {
          await sendTicketStatusEmail(ticket.userEmail, {
            ticketId: ticket.ticketId,
            folderPath: ticket.folderPath,
            status: ticket.status,
            adminComment: ticket.adminComment,
          });
          console.log("✅ Status update email sent to user");
        } catch (emailError) {
          console.error("⚠️ Failed to send status email:", emailError.message);
          // Don't fail the request if email fails
        }
      }

      res.json({
        message: "Ticket updated successfully",
        ticket,
      });
    } catch (error) {
      console.error("❌ Update ticket error:", error);
      res.status(500).json({
        message: "Failed to update ticket",
        error: error.message,
      });
    }
  }
);

// Add Comment to Ticket
router.post("/:ticketId/comments", authMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text } = req.body;

    console.log("💬 Adding comment to ticket:", ticketId);

    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      console.log("❌ Ticket not found:", ticketId);
      return res.status(404).json({ message: "Ticket not found" });
    }

    const comment = {
      text,
      author: req.user.isAdmin ? "Admin" : req.user.name,
      authorType: req.user.isAdmin ? "admin" : "user",
    };

    ticket.comments.push(comment);
    await ticket.save();

    console.log("✅ Comment added successfully");

    res.json({
      message: "Comment added successfully",
      ticket,
    });
  } catch (error) {
    console.error("❌ Add comment error:", error);
    res.status(500).json({
      message: "Failed to add comment",
      error: error.message,
    });
  }
});

module.exports = router;
