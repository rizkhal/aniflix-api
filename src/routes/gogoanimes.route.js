const express = require("express");
const results = require("../static/gogonime.json");

const router = express();

router.get("/gogoanimes/latest", (req, res) => {
  res.json({
    data: results,
  });
});

module.exports = router;
