const ProjectController = require("../controllers/ProjectController");
const express = require("express");
const { protect } = require("../middleware/protect");
const router = express.Router();

router.use(protect);

router.get("/", ProjectController.getProjects);
router.post("/", ProjectController.createProject);

router.get("/:id", ProjectController.getProjectById);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

router.post("/:id/generate", ProjectController.generateAiImages);
//project routes for updates by usesr &client
router.post("/:id/updates", ProjectController.addUpdate);
router.get("/:id/updates", ProjectController.getUpdates);
router.post("/:id/updates/:updateId/comments", ProjectController.addComment);
router.delete("/:id/updates/:updateId", ProjectController.deleteUpdate);

module.exports = router;
