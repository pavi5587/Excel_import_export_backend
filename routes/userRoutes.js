const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  postUploadUsers,
  getUsers,
  updateUsers,
  deleteUsers,
  getExportUsers,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/auth");

var upload = multer({ dest: "./upload/" });

router.post(
  "/upload-users",
  authenticateToken,
  upload.single("file"),
  postUploadUsers
);
router.get("/users", authenticateToken, getUsers);
router.put("/users/:id", authenticateToken, updateUsers);
router.delete("/users/:id", authenticateToken, deleteUsers);
router.get("/export-users", authenticateToken, getExportUsers);
module.exports = router;
