const express = require("express");
const { info, watch } = require("../scripts/samehadaku.crawler");

const router = express();

// params: animeId
router.get("/info", async (req, res) => {
  try {
    const { animeId } = req.query;
    const response = await info(animeId);

    return res.json({
      data: response,
    });
  } catch (error) {
    console.log(error);
  }
});

// params: episodeId
router.get("/watch", async (req, res) => {
  try {
    const { episodeId } = req.query;
    const response = await watch(episodeId);

    return res.json({
      data: response,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
