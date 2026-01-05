const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const protect = require("../middleware/protect");
const admin = require("../middleware/admin");

router.use(protect.protect);

router.use(admin.adminCheck);

router.get("/projects", adminController.getAllProjects);
router.get("/stats", adminController.getStats);
router.get("/users", adminController.getAllUsers);
router.put("/projects/:id/status", adminController.updateProjectStatus);
//update project stats
router.post("/projects/:id/updates", adminController.addProjectUpdate);
module.exports = router;
