const express = require("express");
const authController = require("../controllers/authController.js");
const protect = require("../middleware/protect.js");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect.protect, authController.getCurrentUser);

module.exports = router;
