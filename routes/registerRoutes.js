const express = require("express");

const router = express.Router();

const {
  postRegister,
  postLogin,
  postLogout,
} = require("../controllers/registerController");

router.post("/register", postRegister);
router.post("/login", postLogin);
router.post("/logout", postLogout);
module.exports = router;