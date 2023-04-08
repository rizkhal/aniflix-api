const express = require("express");
const { login, refresh } = require("../controller/auth.controller");

const router = express();

router.post("/auth/login", login);
router.post("/auth/refresh", refresh);

module.exports = router;
