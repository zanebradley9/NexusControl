const express = require("express");

const router = express.Router();

const controller = require("./controller");

router.get("/", controller.getGames);

router.get("/featured", controller.featuredGames);

router.get("/:id", controller.getGame);

router.post("/", controller.createGame);

router.put("/:id", controller.updateGame);

router.delete("/:id", controller.deleteGame);

module.exports = router;