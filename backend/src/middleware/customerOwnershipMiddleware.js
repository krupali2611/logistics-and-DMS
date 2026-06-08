const ApiResponse = require('../utils/ApiResponse');

const resolveValue = (req, source, key) => {
  if (source === 'params') {
    return req.params?.[key];
  }

  if (source === 'query') {
    return req.query?.[key];
  }

  return req.body?.[key];
};

const customerOwnershipMiddleware = ({ source = 'body', key = 'customer_id' } = {}) => (
  req,
  res,
  next
) => {
  const requestedCustomerId = resolveValue(req, source, key);

  if (requestedCustomerId && requestedCustomerId !== req.user?.customer_id) {
    return ApiResponse.error(
      res,
      'Customer users can only access their own data.',
      [],
      403
    );
  }

  next();
};

module.exports = customerOwnershipMiddleware;
