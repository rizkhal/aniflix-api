const express = require("express");
const results = require("./data/gogonime.json");

const app = express();

app.get("/api/gogoanimes/latest", (req, res) => {
  res.json({
    data: results,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`⚡️[server] started on port ${PORT}`);
});
