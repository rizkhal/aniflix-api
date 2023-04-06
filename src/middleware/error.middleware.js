module.exports = (req, res) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    stack: process.env.NODE_ENV === "prod" ? "🥞" : "error message",
  });
};
