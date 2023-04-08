const jwt = require("jsonwebtoken");
const prisma = require("../database/client");
const { findUserById } = require("../model/user.model");

const store = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const { animeId } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
    const user = await findUserById(decoded.userId);

    const anime = await prisma.anime.findFirst({
      where: { url: animeId },
    });

    const alreadyBookmark = await prisma.bookmark.findMany({
      where: { animeId: anime.id, AND: { userId: user.id } },
    });

    if (alreadyBookmark.length) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Already bookmark",
      });
    }

    const mark = await prisma.bookmark.create({
      data: {
        animeId: anime.id,
        userId: user.id,
      },
    });

    return res.json({
      message: "Bookmark success",
      data: mark,
    });
  } catch (error) {
    console.log(error);
  }
};

const destroy = async (req, res) => {
  const { animeId } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
    const user = await findUserById(decoded.userId);

    const anime = await prisma.anime.findFirst({
      where: { url: animeId },
    });

    const where = {
      where: { animeId: anime.id, AND: { userId: user.id } },
    };

    const check = await prisma.bookmark.findMany(where);

    if (!check.length) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Bookmark not exists",
      });
    }

    await prisma.bookmark.deleteMany(where);

    return res.json({
      message: "Bookmark deleted",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  store,
  destroy,
};
