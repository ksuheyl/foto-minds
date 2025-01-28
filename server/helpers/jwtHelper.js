const jwt = require('jsonwebtoken');
require("dotenv").config({path: "../config/.env"});
exports.generateToken = (user) => {
  try {
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Token creation failed');
  }
};

exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: ['HS256'],
    });
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
};