const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../database/client");
const { findUserById } = require("../model/user.model");

const router = express();

router.get("/providers", async (req, res) => {
  const providers = await prisma.provider.findMany();

  return res.json({
    data: providers,
  });
});

router.post("/set/provider", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
    const user = await findUserById(decoded.userId);

    const { providerId } = req.body;

    await prisma.user.update({
      where: { id: user.id },
      data: { providerId: providerId },
    });

    const updatedUser = await findUserById(decoded.userId);

    return res.json({
      message: "User provider updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
