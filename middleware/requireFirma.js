module.exports = function requireFirma(req, res, next) {
  console.log("SESSION:", req.session);
  console.log("USER:", req.session.user);

  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "No session found"
    });
  }

  if (req.session.user.role !== "firma") {
    return res.status(403).json({
      success: false,
      message: "Role is: " + req.session.user.role
    });
  }

  next();
};