require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express();

const authRoutes = require("./routes/auth");
const resetRoutes = require("./routes/reset");
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");
const firmaRoutes = require("./routes/firma");
const sluzbaRoutes = require("./routes/sluzba");

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "tajna_sifra",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/reset", resetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/firma", firmaRoutes);
app.use("/api/sluzba", sluzbaRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});