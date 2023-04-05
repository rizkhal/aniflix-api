module.exports = (err, req, res) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "prod" ? "🥞" : err.stack,
  });
};
