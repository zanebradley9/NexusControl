import express from "express";
import aiRoutes from "./ai-core/api/aiRoutes.js";
import authRoutes from "./ai-core/api/authRoutes.js";
import workflowRoutes from "./ai-core/api/workflowRoutes.js";
import memoryRoutes from "./ai-core/api/memoryRoutes.js";
import logsRoutes from "./ai-core/api/logsRoutes.js";
const router = express.Router();
router.use("/ai", aiRoutes);
router.use("/auth", authRoutes);
router.use("/workflow", workflowRoutes);
router.use("/memory", memoryRoutes);
router.use("/logs", logsRoutes);
router.get("/health", (req, res) => {
res.json({
status: "online",
ai: "active",
security: "enabled"
});
});
export default router;