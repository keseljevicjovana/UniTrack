function requireFirma(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Niste prijavljeni"
    });
  }

  if (req.session.user.role !== "firma") {
    return res.status(403).json({
      success: false,
      message: "Nemate pristup"
    });
  }

  next();
}

module.exports = {
  requireFirma
};