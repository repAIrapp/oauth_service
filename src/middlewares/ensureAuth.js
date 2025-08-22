function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth'); // ou 401 si API REST
}

module.exports = ensureAuth;
