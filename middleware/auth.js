module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    }
    res.redirect('/login');
  },

  isAuthenticatedApi: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
};
