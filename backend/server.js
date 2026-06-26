import express from "express";
import { spawn } from "child_process";
import path from "path";

const app = express();
app.use(express.json());

app.post("/api/jarvis", (req, res) => {
  const { message } = req.body;

  const scriptPath = path.join(
    process.cwd(),
    "backend",
    "Jarvis",
    "main.py"
  );

  const py = spawn("python", [scriptPath, message]);

  let output = "";
  let error = "";

  py.stdout.on("data", (data) => {
    output += data.toString();
  });

  py.stderr.on("data", (data) => {
    error += data.toString();
  });

  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: error || `Python exited with code ${code}`,
      });
    }

    res.json({
      reply: output.trim(),
    });
  });
});

app.listen(5000, () => {
  console.log("🚀 Jarvis API running on port 5000");
});