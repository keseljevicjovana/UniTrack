module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Nemate studentski pristup"
    });
  }

  next();
};