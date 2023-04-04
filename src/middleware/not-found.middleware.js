module.exports = (req, res) => {
  res.status(404).json({
    message: "Error",
    stack: `🔍 - Not Found - ${req.originalUrl}`,
  });
};
