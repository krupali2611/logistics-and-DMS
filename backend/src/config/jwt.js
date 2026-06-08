const jwt = require('jsonwebtoken');

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

const signResetToken = (payload) =>
  jwt.sign(payload, process.env.JWT_RESET_SECRET, {
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m'
  });

const signCustomerAccessToken = (payload) =>
  jwt.sign(payload, process.env.CUSTOMER_JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.CUSTOMER_JWT_ACCESS_EXPIRES_IN || '15m'
  });

const signCustomerRefreshToken = (payload) =>
  jwt.sign(payload, process.env.CUSTOMER_JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.CUSTOMER_JWT_REFRESH_EXPIRES_IN || '7d'
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

const verifyResetToken = (token) =>
  jwt.verify(token, process.env.JWT_RESET_SECRET);

const verifyCustomerAccessToken = (token) =>
  jwt.verify(token, process.env.CUSTOMER_JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET);

const verifyCustomerRefreshToken = (token) =>
  jwt.verify(token, process.env.CUSTOMER_JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET);

module.exports = {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  signCustomerAccessToken,
  signCustomerRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyResetToken,
  verifyCustomerAccessToken,
  verifyCustomerRefreshToken
};
