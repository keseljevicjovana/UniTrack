const express = require("express");
const router = express.Router();

router.post("/reset-password", (req, res) => {
  const { id } = req.body;

  // za sada samo simulacija
  res.json({
    success: true,
    message: "Link za reset poslat (simulacija)"
  });
});

module.exports = router;