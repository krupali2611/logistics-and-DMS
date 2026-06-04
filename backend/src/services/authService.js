const { Op } = require('sequelize');
const {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyRefreshToken,
  verifyResetToken
} = require('../config/jwt');
const db = require('../models');
const AppError = require('../utils/AppError');
const { comparePassword, hashPassword } = require('../utils/password');

const buildAuthPayload = async (userId) => {
  const user = await db.User.scope('withPassword').findByPk(userId, {
    include: [
      {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] },
        include: [
          {
            model: db.Permission,
            as: 'permissions',
            through: { attributes: [] }
          }
        ]
      }
    ]
  });

  if (!user || !user.status) {
    throw new AppError('User not found or inactive.', 401);
  }

  const roles = user.roles.map((role) => role.name);
  const permissions = [...new Set(user.roles.flatMap((role) => role.permissions.map((permission) => permission.name)))];

  return {
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    },
    roles,
    permissions
  };
};

const createTokenSet = async (userId) => {
  const authPayload = await buildAuthPayload(userId);
  const jwtPayload = {
    sub: authPayload.user.id,
    email: authPayload.user.email
  };

  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.RefreshToken.create({
    user_id: userId,
    token: refreshToken,
    expires_at: expiresAt
  });

  return {
    accessToken,
    refreshToken,
    ...authPayload
  };
};

const login = async ({ email, password }) => {
  const user = await db.User.scope('withPassword').findOne({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.status) {
    throw new AppError('Your account is inactive. Please contact the administrator.', 403);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  await user.update({ last_login: new Date() });

  return createTokenSet(user.id);
};

const refresh = async (token) => {
  let decodedToken;

  try {
    decodedToken = verifyRefreshToken(token);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const persistedToken = await db.RefreshToken.findOne({
    where: {
      token,
      user_id: decodedToken.sub,
      expires_at: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!persistedToken) {
    throw new AppError('Refresh token is not recognized.', 401);
  }

  await persistedToken.destroy();
  return createTokenSet(decodedToken.sub);
};

const logout = async (token) => {
  if (!token) {
    return;
  }

  await db.RefreshToken.destroy({
    where: { token }
  });
};

const forgotPassword = async (email) => {
  const user = await db.User.findOne({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    return null;
  }

  const resetToken = signResetToken({
    sub: user.id,
    email: user.email
  });

  return {
    resetToken,
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m'
  };
};

const resetPassword = async ({ token, password }) => {
  let decodedToken;

  try {
    decodedToken = verifyResetToken(token);
  } catch (error) {
    throw new AppError('Invalid or expired reset token.', 401);
  }

  const user = await db.User.scope('withPassword').findByPk(decodedToken.sub);

  if (!user || !user.status) {
    throw new AppError('User not found or inactive.', 404);
  }

  const hashedPassword = await hashPassword(password);

  await user.update({ password: hashedPassword });
  await db.RefreshToken.destroy({ where: { user_id: user.id } });
};

module.exports = {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  buildAuthPayload
};
