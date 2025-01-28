const jwtHelper = require('../helpers/jwtHelper');
const db = require('../models');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('token', token)

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }
  try {
    const decoded = jwtHelper.verifyToken(token);
    req.user = await db.users.findByPk(decoded.id, {
      raw: true
    });
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};
