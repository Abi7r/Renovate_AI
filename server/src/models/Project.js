const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    roomType: {
      type: String,
      enum: [
        "living",
        "bedroom",
        "kitchen",
        "bathroom",
        "office",
        "dining",
        "other",
      ],
      required: true,
    },
    style: {
      type: String,
      enum: [
        "modern",
        "traditional",
        "contemporary",
        "scandinavian",
        "industrial",
        "rustic",
        "Other",
      ],
      required: true,
    },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    dimensions: {
      length: { type: Number, default: 0 },
      breadth: { type: Number, default: 0 },
      area: { type: Number, default: 0 },
      unit: { type: String, enum: ["feet", "meters"], default: "feet" },
    },
    inspirationImages: [
      {
        type: String,
      },
    ],
    generatedImages: [
      {
        url: String,
        prompt: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["in-progress", "completed", "designing", "quoted", "new"],
      default: "new",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    updates: [
      {
        message: {
          type: String,
          required: true,
        },
        images: [String],
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        comments: [
          {
            text: {
              type: String,
              required: true,
            },
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
