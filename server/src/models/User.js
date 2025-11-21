const mongoose = require("mongoose");

const userSchmema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowecase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],

      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },
    phone: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchmema);
module.exports = User;
