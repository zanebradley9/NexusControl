const express = require("express");

const router = express.Router();

const controller = require("./controller");

router.post("/scan", controller.scan);

router.get("/alerts", controller.getAlerts);

router.get("/alerts/:id", controller.getAlert);

router.put("/alerts/:id/resolve", controller.resolveAlert);

router.delete("/alerts/:id", controller.deleteAlert);

module.exports = router;