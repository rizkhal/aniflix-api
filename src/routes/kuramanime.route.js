const express = require("express");
const results = require("../data/kuramanime.json");

const router = express();

router.get("/kuramanime/latest", (req, res) => {
  res.json({
    data: results,
  });
});

module.exports = router;
