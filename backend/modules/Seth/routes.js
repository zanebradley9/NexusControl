const express = require("express");

const router = express.Router();

const controller = require("./controller");

router.post("/chat", controller.chat);

router.get("/history", controller.history);

module.exports = router;