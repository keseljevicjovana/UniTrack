const express = require("express");
const router = express.Router();

// "fake baza"
const users = [
  { id: "admin", password: "123", role: "admin" },
  { id: "student", password: "123", role: "student" }
];

router.post("/login", (req, res) => {
  const { id, password } = req.body;

  const user = users.find(
    (u) => u.id === id && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Netačna lozinka ili username"
    });
  
  }

  res.json({
    success: true,
    role: user.role
  });
});

module.exports = router;