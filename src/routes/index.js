const express = require("express");

const auth = require("./auth.route");

const authMiddleware = require("../middleware/auth.middleware");
const errorMiddleware = require("../middleware/error.middleware");
const notFoundMiddleware = require("../middleware/not-found.middleware");

const samehadaku = require("./samehadaku.route");

const bookmark = require("./bookmark.route");
const providerRouter = require("./provider.route");

const router = express();

router.use(auth);

router.use(authMiddleware);

router.use("/samehadaku", samehadaku);
router.use(bookmark);
router.use(providerRouter);

router.use(errorMiddleware);
router.use(notFoundMiddleware);

module.exports = router;
