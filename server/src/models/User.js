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
    profile: {
      avatar: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      bio: {
        type: String,
        maxlength: 500,
        default: "",
      },
      preferences: {
        notifications: {
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
        newsletter: { type: Boolean, default: true },
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
userSchmema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const User = mongoose.model("User", userSchmema);
module.exports = User;
