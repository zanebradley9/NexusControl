import express from "express";
import { getProjects, createProject } from "./controller.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/", createProject);

export default router;