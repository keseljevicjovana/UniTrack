module.exports = (req, res, next) => {
  if (
    !req.session.user ||
    req.session.user.role !== "studentska_sluzba"
  ) {
    return res.status(403).json({
      success: false,
      message: "Nemate pristup studentske službe"
    });
  }

  next();
};