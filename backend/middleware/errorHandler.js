export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", {
    id: req.id,
    message: err.message,
    stack: err.stack,
  });

  res.status(err.status || 500).json({
    success: false,
    message: "Internal server error",
    requestId: req.id,
  });
};