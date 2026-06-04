export const adminMiddleware = (req, res, next) => {
  const user = req.user;
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Admin resource. Access denied' });
  }
};
