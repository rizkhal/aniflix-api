const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../database/client");
const { findUserById } = require("../model/user.model");

const tokenLists = {};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).json({
        message: "All input is required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user.id, username },
        process.env.JWT_TOKEN,
        {
          expiresIn: process.env.JWT_TOKEN_EXPIRED_AT,
        }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, username },
        process.env.JWT_REFRESH_TOKEN,
        {
          expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED_AT,
        }
      );

      tokenLists[refreshToken] = {
        expiredIn: process.env.JWT_REFRESH_TOKEN_EXPIRED_AT,
        refreshToken: refreshToken,
      };

      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          providerId: user.providerId,
        },
        token: {
          expiresIn: process.env.JWT_TOKEN_EXPIRED_AT,
          accessToken: token,
          refreshToken: refreshToken,
        },
      });
    }

    return res.status(400).json({
      message: "Invalid Credentials",
    });
  } catch (err) {
    console.log(err);
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.headers["x-refresh-token"];

  if (refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

    console.log("decoded", decoded);

    const user = await findUserById(Number(decoded.userId));

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
    }

    const credentials = {
      username: user.username,
      password: user.password,
      providerId: user.providerId,
    };

    const token = jwt.sign(credentials, process.env.JWT_TOKEN, {
      expiresIn: process.env.JWT_TOKEN_EXPIRED_AT,
    });

    const newRefreshToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_REFRESH_TOKEN,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED_AT,
      }
    );

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        providerId: user.providerId,
      },
      token: {
        expiresIn: process.env.JWT_TOKEN_EXPIRED_AT,
        accessToken: token,
        refreshToken: newRefreshToken,
      },
    });
  }

  return res.status(400).json({
    message: "Bad Request",
    error: "Invalid Refresh Token",
    refreshToken,
  });
};

module.exports = {
  login,
  refresh,
};
