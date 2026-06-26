const express = require("express");

const router = express.Router();

const controller = require("./controller");

router.get("/", controller.getAllBooks);

router.get("/:id", controller.getBook);

router.post("/", controller.createBook);

router.put("/:id", controller.updateBook);

router.delete("/:id", controller.deleteBook);

router.post("/:id/review", controller.reviewBook);

module.exports = router;