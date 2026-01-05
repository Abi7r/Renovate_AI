const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoute");
const projectRoutes = require("./routes/projectRoutes");
const redesignRoutes = require("./routes/redesignRoutes");
const adminRoutes = require("./routes/adminRoutes");
const imageRoutes = require("./routes/imageRoutes");
const profileRoutes = require("./routes/profileRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/redesign", redesignRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.json({ message: "RenovateAI API running" });
});

module.exports = app;
