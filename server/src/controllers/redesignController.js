const cloudinary = require("../config/cloudinary");
const { redesignRoom } = require("../services/nanoBanana");
const Project = require("../models/Project");
const uploadBase64ToCloudinary = async (base64) => {
  const response = await cloudinary.uploader.upload(base64, {
    folder: "room-redesigns",
  });
  return response.secure_url;
};
exports.redesignRoomController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const { style, roomType, prompt } = req.body;
    if (!style || !roomType) {
      return res.status(400).json({
        success: false,
        message: "Please provide style and room type",
      });
    }

    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "room-originals" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    };
    console.log("Uploading original to Cloudinary...");
    const originalImageUrl = await uploadToCloudinary(req.file.buffer);
    console.log("Original image uploaded to Cloudinary", originalImageUrl);
    console.log("Starting Nano Banana redesign...");
    const base64Images = await redesignRoom(
      roomType,
      style,
      prompt || "",
      req.file.buffer
    );
    console.log(`Received ${base64Images.length} redesigned images`);
    console.log("Uploading redesigned images to Cloudinary...");
    const redesignedUrls = await Promise.all(
      base64Images.map((base64Image) => uploadBase64ToCloudinary(base64Image))
    );
    console.log("Redesigned images uploaded to Cloudinary", redesignedUrls);
    res.status(200).json({
      success: true,
      data: {
        redesignedImages: redesignedUrls,
        originalImage: originalImageUrl,
      },
    });
    // const uploadStream = cloudinary.uploader.upload_stream(
    //   {
    //     folder: "room-originals",
    //   },
    //   async (err, result) => {
    //     if (err) {
    //       console.log("Error uploading original image to Cloudinary", err);
    //       res.status(500).json({
    //         success: false,
    //         message: "Failed to upload original image to Cloudinary",
    //       });
    //     }
    //     const originalImageUrl = result.secure_url;
    //     console.log("Original image uploaded to Cloudinary", originalImageUrl);
    //     const redesignImages = await redesignRoom(
    //       prompt || "",
    //       style,
    //       roomType,
    //       req.file.buffer
    //     );
    //     res.status(200).json({
    //       success: true,

    //       data: {
    //         redesignedImages: redesignImages,
    //         originalImage: originalImageUrl,
    //       },
    //     });
    //   }
    // );
    // uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Error in redesignRoomController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to redesign room",
    });
  }
};

exports.saveRedesign = async (req, res) => {
  try {
    const {
      title,
      description,
      roomType,
      style,
      originalImage,
      redesignedImages,
    } = req.body;
    const project = await Project.create({
      user: req.user._id,
      title: title || `${style} ${roomType} redesign`,
      description: description || `Redesign of ${roomType} in ${style} style`,
      roomType,
      style,
      inspirationImages: [originalImage],
      generatedImages: redesignedImages.map((url) => ({
        url,
        prompt: "Redesigned from uploaded image",
        createdAt: new Date(),
      })),
      status: "designing",
    });
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.log("Error saving redesign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save redesign",
    });
  }
};
