const jwt = require('jsonwebtoken');
require('dotenv').config();

function getJwtSecret() {
  return process.env.JWT_SECRET || 'homeable-development-only-secret';
}

function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = { signToken, verifyToken };
