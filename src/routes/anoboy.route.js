const express = require("express");
const prisma = require("../database/client");
const { watch, info } = require("../scripts/anoboy.crawler");

const results = require("../static/anoboy/latest.json");

const router = express();

router.get("/anoboy/latest", (req, res) => {
  const result = results.data.map((item) => {
    return {
      ...item,
      image: process.env.ANOBOY_PROVIDER + item.image,
    };
  });

  return res.json({
    data: result,
  });
});

router.get("/anoboy/schedule", async (req, res) => {
  const results = require("../static/anoboy/schedule.json");

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
      data: Object.assign(r, {
        animeId: r.url,
        url: process.env.ANOBOY_PROVIDER + r.url,
        meta: r.meta ? JSON.parse(r.meta) : [],
      }),
    });
  }

  const results = await info(animeId);

  const response = await prisma.$transaction(async (prisma) => {
    const r = await prisma.anime.create({
      data: {
        url: animeId,
        providerId: provider.id,
        title: results.title,
        meta: JSON.stringify(results.meta),
        description: results.description,
      },
    });

    return res.json({
      data: Object.assign(r, {
        animeId: r.url,
        url: process.env.ANOBOY_PROVIDER + r.url,
        meta: r.meta ? JSON.parse(r.meta) : [],
      }),
    });
  });

  return res.json({
    data: response,
  });
});

router.get("/anoboy/watch", async (req, res) => {
  const { episodeId } = req.query;
  if (!episodeId) {
    return res.status(400).json({
      error: "Bad Request",
      message: "episodeId query params is required",
    });
  }

  const find = await prisma.link.findFirst({
    where: {
      episodeId: episodeId,
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

  const results = await watch(episodeId);

  const link = await prisma.$transaction(async (prisma) => {
    const res = await prisma.link.create({
      data: {
        episodeId: episodeId,
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
