
const errorMiddleware = (err,res) => {

  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || "Internal server error",
    errors: err.errors || [],
  });
};
export default errorMiddleware;
