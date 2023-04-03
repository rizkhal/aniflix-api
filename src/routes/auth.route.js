const express = require("express");
const { login } = require("../handler/auth.handler");

const router = express();

router.post("/auth/login", login);

module.exports = router;
