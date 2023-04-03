const express = require("express");
const bookmarkHandler = require("../handler/bookmark.handler");
const authMiddleware = require("../middleware/auth.middleware");

const router = express();

router.use(authMiddleware);

router.post("/bookmark", bookmarkHandler.store);
router.delete("/bookmark", bookmarkHandler.destroy);

module.exports = router;
