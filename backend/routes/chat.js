import express from "express";

const router = express.Router();

// Fake memory DB for now
let messages = [];

/**
 * GET messages by channel
 */
router.get("/:channel", async (req, res) => {
  try {
    const { channel } = req.params;

    const filtered = messages.filter(
      (msg) => msg.channel === channel
    );

    res.json(filtered);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
});

/**
 * POST new message
 */
router.post("/", async (req, res) => {
  try {
    const newMessage = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date(),
    };

    messages.push(newMessage);

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({
      message: "Failed to send message",
    });
  }
});

export default router;