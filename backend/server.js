const express = require("express");
const app = express();

const cors = require("cors");

app.use(cors({
  origin: ["http://localhost:5173"]
}));

app.use(express.json());

// ROUTES
const authRoutes = require("./routes/auth");
const resetRoutes = require("./routes/reset");

app.use("/api/auth", authRoutes);
app.use("/api/reset", resetRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend radi" });
});

app.listen(8080, () => {
  console.log("Server sluša na 8080");
});