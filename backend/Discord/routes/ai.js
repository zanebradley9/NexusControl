import express from "express";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { message } = req.body;

  res.json({
    reply: `AI received: ${message}`
  });
});

export default router;