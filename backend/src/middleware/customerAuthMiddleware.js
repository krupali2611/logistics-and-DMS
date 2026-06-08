const { verifyCustomerAccessToken } = require('../config/jwt');
const db = require('../models');
const ApiResponse = require('../utils/ApiResponse');

const customerAuthMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authorization token is required.', [], 401);
    }

    const token = authorization.split(' ')[1];
    const decoded = verifyCustomerAccessToken(token);
    const customerUser = await db.CustomerUser.findByPk(decoded.sub, {
      include: [
        {
          model: db.Customer,
          as: 'customer',
          attributes: [
            'id',
            'customer_code',
            'customer_type',
            'company_name',
            'contact_person',
            'email',
            'phone',
            'status',
            'verification_status'
          ]
        }
      ]
    });

    if (!customerUser || customerUser.status !== 'ACTIVE') {
      return ApiResponse.error(res, 'Customer account not found or inactive.', [], 401);
    }

    if (!customerUser.customer || customerUser.customer.status !== 'ACTIVE') {
      return ApiResponse.error(res, 'Customer account is not available.', [], 403);
    }

    req.customerUser = customerUser;
    req.user = {
      id: null,
      customer_user_id: customerUser.id,
      customer_id: customerUser.customer_id,
      email: customerUser.email,
      phone: customerUser.phone,
      auth_scope: 'customer'
    };

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired customer access token.', [], 401);
  }
};

module.exports = customerAuthMiddleware;
