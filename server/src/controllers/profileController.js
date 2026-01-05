const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log("Error while fetching profile", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, address, preferences } = req.body;

    if (phone) {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
      if (!/^\d+$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must contain only digits",
        });
      }

      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits",
        });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.profile) {
      user.profile = {};
    }
    if (name) user.name = name;
    if (phone) user.profile.phone = phone;
    if (bio) user.profile.bio = bio;
    if (address) {
      user.profile.address = { ...user.profile.address, ...address };
    }
    if (preferences) {
      user.profile.preferences = {
        ...user.profile.preferences,
        ...preferences,
      };
    }
    await user.save();
    const updatedUser = await User.findById(req.user._id).select("-password");
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log("Error while updating profile", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      });
    }
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB",
      });
    }
    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "avatars",
      transformation: [
        { width: 400, height: 400, gravity: "face", crop: "fill" },
      ],
    });
    const user = await User.findById(req.user._id);
    if (!user.profile) {
      user.profile = {};
    }
    if (user.profile.avatar) {
      const oldPublicId = user.profile.avatar.split("/upload")[1].split(".")[0];
      await cloudinary.uploader.destroy(`avatars/${oldPublicId}`);
    }
    user.profile.avatar = result.secure_url;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: result.secure_url,
      },
    });
  } catch (error) {
    console.log("Error while uploading avatar", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      error: error.message,
    });
  }
};
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.profile.avatar) {
      return res.status(400).json({
        success: false,
        message: "No avatar to delete",
      });
    }
    const publicId = user.profile.avatar.split("/upload")[1].split(".")[0];
    await cloudinary.uploader.destroy(`avatars/${publicId}`);
    user.profile.avatar = "";
    await user.save();
    res.status(200).json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting avatar", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete avatar",
      error: error.message,
    });
  }
};
