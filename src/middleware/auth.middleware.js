const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ");

  if (!token) {
    return res.status(403).json({
      message: "Authorization token is required for authentication",
    });
  }

  try {
    const decoded = jwt.verify(token[1], process.env.JWT_TOKEN);
    // console.log(decoded);
  } catch (err) {
    return res.status(401).json({
      message: "Authorization token is invalid",
    });
  }

  next();
};
