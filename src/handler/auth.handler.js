const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../database/client");

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

module.exports = {
  login,
};
