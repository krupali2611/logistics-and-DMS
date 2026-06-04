const db = require('../models');
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/password');

const getUserWithRoles = (userId) =>
  db.User.findByPk(userId, {
    include: [
      {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }
    ]
  });

const listUsers = async () =>
  db.User.findAll({
    include: [
      {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }
    ],
    order: [['created_at', 'DESC']]
  });

const createUser = async ({ first_name, last_name, email, phone, password, role_ids = [] }) => {
  const existingUser = await db.User.findOne({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    throw new AppError('User with this email already exists.', 409);
  }

  const hashedPassword = await hashPassword(password);
  const user = await db.User.create({
    first_name,
    last_name,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,
    status: true
  });

  if (role_ids.length > 0) {
    const roles = await db.Role.findAll({ where: { id: role_ids } });
    await user.setRoles(roles);
  }

  return getUserWithRoles(user.id);
};

const updateUser = async (id, payload) => {
  const user = await db.User.scope('withPassword').findByPk(id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const { role_ids, email, ...rest } = payload;

  if (email && email.toLowerCase() !== user.email) {
    const emailInUse = await db.User.findOne({ where: { email: email.toLowerCase() } });
    if (emailInUse) {
      throw new AppError('User with this email already exists.', 409);
    }
  }

  await user.update({
    ...rest,
    ...(email ? { email: email.toLowerCase() } : {})
  });

  if (Array.isArray(role_ids)) {
    const roles = await db.Role.findAll({ where: { id: role_ids } });
    await user.setRoles(roles);
  }

  return getUserWithRoles(user.id);
};

const deleteUser = async (id) => {
  const user = await db.User.findByPk(id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  await db.RefreshToken.destroy({ where: { user_id: id } });
  await user.destroy();
};

const getProfile = async (userId) => {
  const user = await getUserWithRoles(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

const updateProfile = async (userId, payload) => {
  const user = await db.User.scope('withPassword').findByPk(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const { first_name, last_name, phone } = payload;
  await user.update({ first_name, last_name, phone });

  return getUserWithRoles(userId);
};

const changePassword = async (userId, current_password, new_password) => {
  const user = await db.User.scope('withPassword').findByPk(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const isMatch = await comparePassword(current_password, user.password);

  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 400);
  }

  const hashedPassword = await hashPassword(new_password);

  await user.update({ password: hashedPassword });
  await db.RefreshToken.destroy({ where: { user_id: userId } });
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword
};
