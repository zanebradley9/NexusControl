const express = require("express");

const router = express.Router();

const controller = require("./controller");

router.get("/", controller.getStocks);

router.get("/analytics", controller.analytics);

router.get("/:id", controller.getStock);

router.post("/", controller.createStock);

router.put("/:id", controller.updateStock);

router.delete("/:id", controller.deleteStock);

module.exports = router;