const express = require("express");

const auth = require("./auth.route");

const notFoundMiddleware = require("../middleware/not-found.middleware");

const anoboy = require("./anoboy.route");
const bookmark = require("./bookmark.route");
const providerRouter = require("./provider.route");

const router = express();

router.use(auth);
router.use(anoboy);
router.use(bookmark);
router.use(providerRouter);

router.use(notFoundMiddleware);

module.exports = router;
