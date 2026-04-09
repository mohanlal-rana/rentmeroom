import multer from "multer";

const errorMiddleware = (err, req, res, next) => {
  // Multer-specific errors (file size, file type)
  if (err instanceof multer.MulterError || (err.message && err.message.includes("Only .jpg"))) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Zod validation errors
  if (err.errors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors,
    });
  }

  // Generic errors (fallback)
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    errors: err.errors || [],
  });
};

export default errorMiddleware;