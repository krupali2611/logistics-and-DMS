const { verifyAccessToken } = require('../config/jwt');
const db = require('../models');
const ApiResponse = require('../utils/ApiResponse');

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authorization token is required.', [], 401);
    }

    const token = authorization.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await db.User.findByPk(decoded.sub);

    if (!user || !user.status) {
      return ApiResponse.error(res, 'User not found or inactive.', [], 401);
    }

    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired access token.', [], 401);
  }
};

module.exports = authMiddleware;
