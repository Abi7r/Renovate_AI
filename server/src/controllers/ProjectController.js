const Project = require("../models/Project");
const { generateImages } = require("../services/stabilityAiService");

exports.generateAiImages = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }
    const promptBuild =
      project.description ||
      `A beautiful ${project.style} style ${project.roomType}`;
    console.log("Starting AI generation for project:", project._id);
    const images = await generateImages(
      promptBuild,
      project.style,
      project.roomType
    );
    const genImages = images.map((image) => ({
      url: image.url,
      promptUsed: promptBuild,
      createdAt: Date.now(),
    }));
    project.generatedImages.push(...genImages);
    project.status = "designing";

    await project.save();
    return res.status(200).json({
      success: true,
      message: "Images generated succesfully",
      data: {
        project,
        newImages: genImages,
      },
    });
  } catch (error) {
    console.error("Error in generateAIImages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate images",
    });
  }
};

exports.getProjects = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const projects = await Project.find({ user: req.user._id })
      .select(
        "title description roomType style status budget dimensions createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .lean();
    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.log("Error while fetching projects", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, roomType, style, budget, dimensions } =
      req.body;
    if (!roomType || !style || !title) {
      return res.status(400).json({
        success: false,
        message: "Title,room type and style are required",
      });
    }
    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      roomType,
      style,
      budget,
      dimensions,
    });
    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    console.log("error while creating project", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({ path: "user", select: "-password" })
      .populate("updates.createdBy", "name email role")
      .populate("updates.comments.user", "name email role");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    const isAdmin = req.user.role === "admin";
    const isOwner = project.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(401).json({
        success: false,
        message: "unauthorized user",
      });
    }

    // if (project.user.toString() !== req.user._id.toString()) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "unauthorized user",
    //   });
    // }
    console.log("Project updates:", project.updates);
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.log("error while fetching project by id", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "unauthorized user",
      });
    }
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.log("Error while updating project", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "unauthorized user",
      });
    }
    await project.deleteOne();

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.log("Error during deleting project", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
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
      images: Array.isArray(images)
        ? images.filter((img) => typeof img === "string" && img.trim())
        : [],
      createdBy: req.user._id,
      createdAt: new Date(),
    };
    project.updates.push(update);
    await project.save();
    await project.populate("updates.createdBy", "name email role");
    await project.populate("updates.comments.user", "name email role");
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
    const project = await Project.findById(req.params.id)
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
      new Date(b.createdAt) - new Date(a.createdAt);
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
    const update = project.updates.id(updateId);
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
    await project.populate("updates.comments.user", "name email role");
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

    console.log(
      "Delete request - Project ID:",
      projectId,
      "Update ID:",
      updateId
    );

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const update = project.updates.id(updateId);

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

    project.updates.pull(updateId);
    await project.save();

    console.log("Update deleted successfully");

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
