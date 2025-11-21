const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "RenovateAI API running" });
});

module.exports = app;
