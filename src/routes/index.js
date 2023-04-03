const express = require("express");

const auth = require("./auth.route");

const anoboy = require("./anoboy.route");
const gogoanime = require("./gogoanimes.route");
const bookmark = require("./bookmark.route");

const router = express();

router.use(auth);
router.use(anoboy);
router.use(gogoanime);
router.use(bookmark);

module.exports = router;
