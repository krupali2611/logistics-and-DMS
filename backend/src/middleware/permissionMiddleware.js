const db = require('../models');
const ApiResponse = require('../utils/ApiResponse');

const permissionMiddleware = (requiredPermission) => async (req, res, next) => {
  const user = await db.User.findByPk(req.user.id, {
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

  if (!user) {
    return ApiResponse.error(res, 'User not found.', [], 401);
  }

  const permissionNames = new Set(
    user.roles.flatMap((role) => role.permissions.map((permission) => permission.name))
  );

  if (!permissionNames.has(requiredPermission)) {
    return ApiResponse.error(
      res,
      'You do not have permission to perform this action.',
      [],
      403
    );
  }

  next();
};

module.exports = permissionMiddleware;
