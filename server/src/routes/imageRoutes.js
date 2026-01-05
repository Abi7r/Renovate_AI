const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
const { protect } = require("../middleware/protect");
const upload = require("../middleware/upload");
router.use(protect);

router.post("/upload", upload.single("image"), imageController.uploadImage);
router.post(
  "uploadMultiple",
  upload.array("images", 10),
  imageController.uploadMultipleImages
);
router.delete("/delete/:publicId", imageController.deleteImage);
module.exports = router;
