const express = require("express");
const bookmarkController = require("../controller/bookmark.controller");

const router = express();

router.post("/bookmark", bookmarkController.store);
router.delete("/bookmark", bookmarkController.destroy);

module.exports = router;
