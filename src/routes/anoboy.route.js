const express = require("express");
const results = require("../static/anoboy.json");
const prisma = require("../database/client");
const { detail, schedule, info } = require("../scripts/anoboy.crawler");

const router = express();

router.get("/anoboy/latest", (req, res) => {
  return res.json({
    data: results,
  });
});

router.get("/anoboy/schedule", async (req, res) => {
  const results = await schedule();

  return res.json({
    data: results,
  });
});

router.get("/anoboy/info", async (req, res) => {
  const { animeId } = req.query;
  if (!animeId) {
    return res.status(400).json({
      error: "Bad Request",
      message: "animeId query params is required",
    });
  }

  const provider = await prisma.provider.findFirst({
    where: { name: "anoboy" },
  });

  const find = await prisma.anime.findMany({
    include: { provider: true },
    where: {
      providerId: provider.id,
      AND: {
        url: animeId,
      },
    },
  });

  if (find.length) {
    const r = find[0];

    return res.json({
      data: {
        ...r,
        meta: JSON.parse(r.meta),
      },
    });
  }

  const results = await info(animeId);

  const response = await prisma.$transaction(async (prisma) => {
    const res = await prisma.anime.create({
      data: {
        url: animeId,
        providerId: provider.id,
        title: results.title,
        meta: JSON.stringify(results.meta),
        description: results.description,
      },
    });

    return {
      ...res,
      meta: JSON.parse(res.meta),
    };
  });

  return res.json({
    data: response,
  });
});

router.get("/anoboy/watch", async (req, res) => {
  const { animeId } = req.query;
  if (!animeId) {
    return res.status(400).json({
      error: "Bad Request",
      message: "animeId query params is required",
    });
  }

  const find = await prisma.link.findFirst({
    where: {
      animeId: animeId,
    },
  });

  if (find) {
    return res.json({
      data: {
        ...find,
        meta: JSON.parse(find.meta),
      },
    });
  }

  const results = await detail(animeId);

  const link = await prisma.$transaction(async (prisma) => {
    const res = await prisma.link.create({
      data: {
        animeId: animeId,
        meta: JSON.stringify(results),
      },
    });

    return {
      ...res,
      meta: JSON.parse(res.meta),
    };
  });

  return res.json({
    data: link,
  });
});

module.exports = router;
