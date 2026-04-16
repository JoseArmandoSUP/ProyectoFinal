const { getPoolByRole } = require('../config/db');

const withDbRole = (req, res, next) => {
  const role = req.user?.role || 'vendedor';
  req.db = getPoolByRole(role);
  next();
};

module.exports = { withDbRole };