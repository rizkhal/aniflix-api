const express = require("express");
const prisma = require("../database/client");
const { info, watch, onGoing } = require("../scripts/samehadaku.crawler");

const router = express();

router.get("/ongoing", async (req, res) => {
  try {
    const response = await onGoing();

    return res.json({
      data: response,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/info/:animeId", async (req, res) => {
  try {
    const { animeId } = req.params;
    const response = await info(animeId);

    return res.json({
      data: response,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/watch/:serverId/:episodeId", async (req, res) => {
  try {
    const { serverId, episodeId } = req.params;
    const server = await prisma.animeServer.findFirst({
      where: { id: Number(serverId) },
    });

    const response = await watch(server.name, episodeId);

    if (typeof response === "object" && !Object.keys(response).length) {
      return res.status(500).json({
        message: "Unable to finish request, please try again",
      });
    }

    return res.json({
      data: response,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
