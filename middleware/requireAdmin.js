module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Nemate admin pristup"
    });
  }

  next();
};