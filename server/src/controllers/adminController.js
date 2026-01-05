const { promises } = require("form-data");
const Project = require("../models/Project");
const User = require("../models/User");

exports.addUpdate = async (req, res) => {
  try {
    const { message, images } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "project not found",
      });
    }
    const isAdmin = req.user.role === "admin";
    const isOwner = project.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }
    const update = {
      message: message.trim(),
      images: images || [],
      createdBy: req.user._id,
      createdAt: new Date(),
    };
    project.updates.push(update);
    await project.save();
    await project.populate("user", "name email");
    res.status(201).json({
      success: true,
      message: "update posted successfully",
      data: project.updates[project.updates.length - 1],
    });
  } catch (error) {
    console.error("Error in addUpdate:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getUpdates = async (req, res) => {
  try {
    const project = await project
      .findById(req.params.id)
      .select("updates user")
      .populate("updates.createdBy", "name email role")
      .populate("updates.comments.user", "name email role")
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    const isAdmin = req.user.role === "admin";
    const isOwner = project.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }
    const updates = project.updates.sort((a, b) => {
      new Date(a.createdAt) - new Date(b.createdAt);
    });
    res.json({
      success: true,
      count: updates.length,
      data: updates,
    });
  } catch (error) {
    console.error("Error in getUpdates:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: projectId, updateId } = req.params;
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    const isAdmin = req.user.role === "admin";
    const isOwner = project.user.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }
    const update = await project.updates.id(updateId);
    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Update not found",
      });
    }
    const comment = {
      text: text.trim(),
      user: req.user._id,
      createdAt: new Date(),
    };
    update.comments.push(comment);
    await project.save();
    await project.populate("user", "name email role");
    const newComment = update.comments[update.comments.length - 1];
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.deleteUpdate = async (req, res) => {
  try {
    const { id: projectId, updateId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    const update = await project.updates.id(updateId);
    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Update not found",
      });
    }
    const isAdmin = req.user.role === "admin";
    const isCreator = update.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this update",
      });
    }
    update.remove();
    await project.save();
    res.status(200).json({
      success: true,
      message: "Update deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteUpdate:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.addProjectUpdate = async (req, res) => {
  try {
    const { message, images } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const update = {
      message: message.trim(),
      images: images || [],
      createdBy: req.user._id,
      createdAt: new Date(),
    };
    project.updates.push(update);
    if (project.status === "new") {
      project.status = "in-progress";
    }
    await project.save();
    await project.populate("updates.createdBy", "name email role");
    res.status(201).json({
      success: true,
      message: "Update posted successfully",
      data: project.updates[project.updates.length - 1],
    });
  } catch (error) {
    console.error("Error in addProjectUpdate:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getAllProjects = async (req, res) => {
  try {
    const {
      status,
      sortby = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};
    if (status && status != "all") {
      filter.status = status;
    }
    const sort = {};
    sort[sortby] = order === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .select(
          "title description roomType style status createdAt user budget dimensions"
        )

        .populate("user", "name email ")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Project.countDocuments(filter),
    ]);
    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const validStatuses = [
      "new",
      "in-progress",
      "designing",
      "quoted",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNotes !== undefined && { adminNotes }) },
      { new: true, runValidators: true }
    ).select("_id title status adminNotes");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    project.status = status;
    if (adminNotes != undefined) {
      project.adminNotes = adminNotes;
    }
    await project.save();
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error in updateProjectStatus:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getStats = async (req, res) => {
  try {
    const [totalProjects, totalUsers, projectsByStatus] = await Promise.all([
      Project.countDocuments(),
      User.countDocuments({ role: "client" }),
      Project.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);
    const statusCounts = {
      new: 0,
      "in-progress": 0,
      designing: 0,
      quoted: 0,
      completed: 0,
    };
    projectsByStatus.forEach((project) => {
      statusCounts[project._id] = project.count;
    });
    const recentProjects = await Project.find()
      .select("title ,roomType ,style ,status ,createdAt,user")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    res.json({
      success: true,
      data: {
        totalProjects,
        totalUsers,
        statusCounts,
        recentProjects,
      },
    });
  } catch (error) {
    console.error("Error in getStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "client" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    console.log(`Found ${users.length} clients`);
    const usersWithProjects = await Promise.all(
      users.map(async (user) => {
        const projectCount = await Project.countDocuments({ user: user._id });
        return { ...user, projectCount, profile: user.profile || {} };
      })
    );
    console.log("Users with project counts:", usersWithProjects);
    res.json({
      success: true,
      count: usersWithProjects.length,
      data: usersWithProjects,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
