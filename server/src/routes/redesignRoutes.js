const express = require("express");
const router = express.Router();
const redesignController = require("../controllers/redesignController");
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");

router.use(protect.protect);

// POST /api/redesign
router.post(
  "/",
  upload.single("image"),
  redesignController.redesignRoomController
);

// POST /api/redesign/save
router.post("/save", redesignController.saveRedesign);

module.exports = router;
