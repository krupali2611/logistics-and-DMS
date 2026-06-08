const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  signCustomerAccessToken,
  signCustomerRefreshToken,
  verifyCustomerRefreshToken
} = require('../config/jwt');
const db = require('../models');
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/password');
const { CUSTOMER_OTP_TYPES } = require('../constants/customerAuthConstants');

const OTP_TTL_MINUTES = Number(process.env.CUSTOMER_OTP_TTL_MINUTES || 10);
const CUSTOMER_REFRESH_TOKEN_TTL_DAYS = Number(
  process.env.CUSTOMER_JWT_REFRESH_TTL_DAYS || 7
);

const normalizeEmail = (value) => value?.trim().toLowerCase();
const normalizePhone = (value) => value?.trim();
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);

const createCustomerCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `CUS-PORTAL-${suffix}`;
    const existing = await db.Customer.findOne({
      where: { customer_code: code },
      attributes: ['id']
    });

    if (!existing) {
      return code;
    }
  }

  throw new AppError('Unable to generate a customer code.', 500);
};

const buildCustomerUserProfile = (customerUser) => ({
  id: customerUser.id,
  customer_id: customerUser.customer_id,
  first_name: customerUser.first_name,
  last_name: customerUser.last_name,
  email: customerUser.email,
  phone: customerUser.phone,
  profile_image: customerUser.profile_image,
  status: customerUser.status,
  is_phone_verified: customerUser.is_phone_verified,
  is_email_verified: customerUser.is_email_verified,
  last_login: customerUser.last_login,
  created_at: customerUser.created_at,
  updated_at: customerUser.updated_at
});

const buildCustomerSummary = (customer) =>
  customer
    ? {
        id: customer.id,
        customer_code: customer.customer_code,
        customer_type: customer.customer_type,
        company_name: customer.company_name,
        contact_person: customer.contact_person,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        verification_status: customer.verification_status
      }
    : null;

const buildAuthPayload = async (customerUserId) => {
  const customerUser = await db.CustomerUser.scope('withPassword').findByPk(customerUserId, {
    include: [
      {
        model: db.Customer,
        as: 'customer'
      }
    ]
  });

  if (!customerUser) {
    throw new AppError('Customer user not found.', 404);
  }

  return {
    user: buildCustomerUserProfile(customerUser),
    customer: buildCustomerSummary(customerUser.customer)
  };
};

const createTokenSet = async (customerUserId) => {
  const authPayload = await buildAuthPayload(customerUserId);
  const jwtPayload = {
    sub: authPayload.user.id,
    customer_id: authPayload.user.customer_id,
    email: authPayload.user.email,
    phone: authPayload.user.phone,
    scope: 'customer'
  };

  const accessToken = signCustomerAccessToken(jwtPayload);
  const refreshToken = signCustomerRefreshToken(jwtPayload);
  const expiresAt = new Date(
    Date.now() + CUSTOMER_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  await db.CustomerRefreshToken.create({
    customer_user_id: customerUserId,
    token: refreshToken,
    expires_at: expiresAt
  });

  return {
    accessToken,
    refreshToken,
    ...authPayload
  };
};

const generateOtpCode = () => `${crypto.randomInt(100000, 999999)}`;

const resolveCustomerUser = async ({ customer_user_id, email, phone, includeCustomer = false }) => {
  const where = {};

  if (customer_user_id) {
    where.id = customer_user_id;
  } else if (email) {
    where.email = normalizeEmail(email);
  } else if (phone) {
    where.phone = normalizePhone(phone);
  } else {
    throw new AppError('A customer user reference is required.', 422);
  }

  const customerUser = await db.CustomerUser.scope('withPassword').findOne({
    where,
    include: includeCustomer
      ? [
          {
            model: db.Customer,
            as: 'customer'
          }
        ]
      : undefined
  });

  if (!customerUser) {
    throw new AppError('Customer user not found.', 404);
  }

  return customerUser;
};

const createOtpRecord = async ({ customerUserId, type, transaction }) => {
  if (!CUSTOMER_OTP_TYPES.includes(type)) {
    throw new AppError('Invalid OTP type.', 422);
  }

  const otpCode = generateOtpCode();
  const hashedOtp = await hashPassword(otpCode);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await db.CustomerOtp.update(
    {
      expires_at: new Date(),
      verified_at: null
    },
    {
      where: {
        customer_user_id: customerUserId,
        type,
        verified_at: null,
        expires_at: {
          [Op.gt]: new Date()
        }
      },
      transaction
    }
  );

  const record = await db.CustomerOtp.create({
    customer_user_id: customerUserId,
    otp: hashedOtp,
    type,
    expires_at: expiresAt
  }, { transaction });

  return {
    record,
    otpCode,
    expiresAt
  };
};

const activateCustomerUserIfEligible = async (customerUser) => {
  const shouldActivate =
    customerUser.status !== 'BLOCKED' &&
    (customerUser.is_email_verified || customerUser.is_phone_verified);

  if (shouldActivate && customerUser.status !== 'ACTIVE') {
    await customerUser.update({ status: 'ACTIVE' });
  }
};

const assertCustomerUserAvailability = (customerUser) => {
  if (customerUser.status === 'BLOCKED') {
    throw new AppError('Your account has been blocked. Please contact support.', 403);
  }

  if (customerUser.customer?.status === 'BLOCKED') {
    throw new AppError('Your customer account has been blocked. Please contact support.', 403);
  }
};

const ensureUniqueCustomerUser = async ({ email, phone, excludeId = null }) => {
  const filters = [];

  if (email) {
    filters.push({ email: normalizeEmail(email) });
  }

  if (phone) {
    filters.push({ phone: normalizePhone(phone) });
  }

  if (!filters.length) {
    return;
  }

  const existing = await db.CustomerUser.findOne({
    where: {
      [Op.and]: [
        { [Op.or]: filters },
        excludeId ? { id: { [Op.ne]: excludeId } } : {}
      ]
    }
  });

  if (!existing) {
    return;
  }

  if (email && existing.email === normalizeEmail(email)) {
    throw new AppError('Email is already registered.', 409);
  }

  if (phone && existing.phone === normalizePhone(phone)) {
    throw new AppError('Phone number is already registered.', 409);
  }
};

const resolveRegistrationCustomer = async ({
  customer_id,
  first_name,
  last_name,
  email,
  phone,
  transaction
}) => {
  if (customer_id) {
    const customer = await db.Customer.findByPk(customer_id, { transaction });

    if (!customer) {
      throw new AppError('Customer not found.', 404);
    }

    if (customer.status === 'BLOCKED') {
      throw new AppError('Customer account is blocked.', 403);
    }

    return customer;
  }

  const existingCustomer = await db.Customer.findOne({
    where: {
      [Op.or]: [{ email: normalizeEmail(email) }, { phone: normalizePhone(phone) }]
    },
    transaction
  });

  if (existingCustomer) {
    return existingCustomer;
  }

  return db.Customer.create(
    {
      customer_code: await createCustomerCode(),
      customer_type: 'INDIVIDUAL',
      company_name: `${normalizeText(first_name)} ${normalizeText(last_name)}`.trim(),
      contact_person: `${normalizeText(first_name)} ${normalizeText(last_name)}`.trim(),
      email: normalizeEmail(email),
      phone: normalizePhone(phone),
      status: 'ACTIVE',
      verification_status: 'PENDING'
    },
    { transaction }
  );
};

const buildOtpResponse = ({ otpCode, expiresAt }) =>
  process.env.NODE_ENV !== 'production'
    ? {
        otp: otpCode,
        expires_at: expiresAt
      }
    : {
        expires_at: expiresAt
      };

const register = async (payload) => {
  await ensureUniqueCustomerUser({
    email: payload.email,
    phone: payload.phone
  });

  const transaction = await db.sequelize.transaction();

  try {
    const customer = await resolveRegistrationCustomer({
      ...payload,
      transaction
    });

    const customerUser = await db.CustomerUser.create(
      {
        customer_id: customer.id,
        first_name: normalizeText(payload.first_name),
        last_name: normalizeText(payload.last_name),
        email: normalizeEmail(payload.email),
        phone: normalizePhone(payload.phone),
        password: await hashPassword(payload.password),
        status: 'INACTIVE'
      },
      { transaction }
    );

    const { otpCode, expiresAt } = await createOtpRecord({
      customerUserId: customerUser.id,
      type: 'EMAIL_VERIFICATION',
      transaction
    });

    await transaction.commit();

    return {
      message: 'Registration successful. Verify the OTP to activate your account.',
      customer_user_id: customerUser.id,
      customer_id: customer.id,
      next_step: 'OTP_VERIFICATION',
      otp_type: 'EMAIL_VERIFICATION',
      ...buildOtpResponse({ otpCode, expiresAt })
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const login = async ({ identifier, password }) => {
  const normalizedIdentifier = normalizeText(identifier);
  const isEmail = normalizedIdentifier.includes('@');

  const customerUser = await db.CustomerUser.scope('withPassword').findOne({
    where: isEmail
      ? { email: normalizeEmail(normalizedIdentifier) }
      : { phone: normalizePhone(normalizedIdentifier) },
    include: [
      {
        model: db.Customer,
        as: 'customer'
      }
    ]
  });

  if (!customerUser) {
    throw new AppError('Invalid credentials.', 401);
  }

  assertCustomerUserAvailability(customerUser);

  if (customerUser.status !== 'ACTIVE') {
    throw new AppError('Account is not active. Please verify your OTP first.', 403);
  }

  const isPasswordValid = await comparePassword(password, customerUser.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials.', 401);
  }

  await customerUser.update({ last_login: new Date() });

  return createTokenSet(customerUser.id);
};

const refreshToken = async (token) => {
  let decodedToken;

  try {
    decodedToken = verifyCustomerRefreshToken(token);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const persistedToken = await db.CustomerRefreshToken.findOne({
    where: {
      token,
      customer_user_id: decodedToken.sub,
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

  await db.CustomerRefreshToken.destroy({
    where: { token }
  });
};

const sendOtp = async (payload) => {
  const customerUser = await resolveCustomerUser({
    customer_user_id: payload.customer_user_id,
    email: payload.email,
    phone: payload.phone
  });

  const { otpCode, expiresAt } = await createOtpRecord({
    customerUserId: customerUser.id,
    type: payload.type
  });

  return {
    customer_user_id: customerUser.id,
    type: payload.type,
    ...buildOtpResponse({ otpCode, expiresAt })
  };
};

const resendOtp = async (payload) => sendOtp(payload);

const markOtpVerified = async (otpRecord) => {
  await otpRecord.update({ verified_at: new Date() });
};

const verifyOtp = async (payload) => {
  const customerUser = await resolveCustomerUser({
    customer_user_id: payload.customer_user_id,
    email: payload.email,
    phone: payload.phone,
    includeCustomer: true
  });

  const otpRecord = await db.CustomerOtp.findOne({
    where: {
      customer_user_id: customerUser.id,
      type: payload.type,
      verified_at: null,
      expires_at: {
        [Op.gt]: new Date()
      }
    },
    order: [['created_at', 'DESC']]
  });

  if (!otpRecord) {
    throw new AppError('OTP not found or expired.', 400);
  }

  const isOtpValid = await comparePassword(payload.otp, otpRecord.otp);

  if (!isOtpValid) {
    throw new AppError('Invalid OTP.', 400);
  }

  await markOtpVerified(otpRecord);

  if (payload.type === 'EMAIL_VERIFICATION' && !customerUser.is_email_verified) {
    await customerUser.update({ is_email_verified: true });
  }

  if (payload.type === 'PHONE_VERIFICATION' && !customerUser.is_phone_verified) {
    await customerUser.update({ is_phone_verified: true });
  }

  await customerUser.reload({
    include: [
      {
        model: db.Customer,
        as: 'customer'
      }
    ]
  });
  await activateCustomerUserIfEligible(customerUser);
  await customerUser.reload({
    include: [
      {
        model: db.Customer,
        as: 'customer'
      }
    ]
  });

  if (
    payload.type === 'EMAIL_VERIFICATION' ||
    payload.type === 'PHONE_VERIFICATION'
  ) {
    await customerUser.customer?.update({ verification_status: 'VERIFIED' });
  }

  return {
    customer_user_id: customerUser.id,
    type: payload.type,
    verified_at: otpRecord.verified_at || new Date(),
    account_status: customerUser.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
  };
};

const forgotPassword = async ({ identifier }) => {
  const normalizedIdentifier = normalizeText(identifier);
  const isEmail = normalizedIdentifier.includes('@');

  const customerUser = await db.CustomerUser.findOne({
    where: isEmail
      ? { email: normalizeEmail(normalizedIdentifier) }
      : { phone: normalizePhone(normalizedIdentifier) }
  });

  if (!customerUser) {
    return {};
  }

  const { otpCode, expiresAt } = await createOtpRecord({
    customerUserId: customerUser.id,
    type: 'FORGOT_PASSWORD'
  });

  return {
    customer_user_id: customerUser.id,
    ...buildOtpResponse({ otpCode, expiresAt })
  };
};

const resetPassword = async ({ identifier, otp, password }) => {
  const normalizedIdentifier = normalizeText(identifier);
  const isEmail = normalizedIdentifier.includes('@');

  const customerUser = await db.CustomerUser.scope('withPassword').findOne({
    where: isEmail
      ? { email: normalizeEmail(normalizedIdentifier) }
      : { phone: normalizePhone(normalizedIdentifier) }
  });

  if (!customerUser) {
    throw new AppError('Customer user not found.', 404);
  }

  const otpRecord = await db.CustomerOtp.findOne({
    where: {
      customer_user_id: customerUser.id,
      type: 'FORGOT_PASSWORD',
      verified_at: null,
      expires_at: {
        [Op.gt]: new Date()
      }
    },
    order: [['created_at', 'DESC']]
  });

  if (!otpRecord) {
    throw new AppError('OTP not found or expired.', 400);
  }

  const isOtpValid = await comparePassword(otp, otpRecord.otp);

  if (!isOtpValid) {
    throw new AppError('Invalid OTP.', 400);
  }

  await customerUser.update({ password: await hashPassword(password) });
  await markOtpVerified(otpRecord);
  await db.CustomerRefreshToken.destroy({
    where: { customer_user_id: customerUser.id }
  });
};

const getCustomerProfile = async (customerUserId) => buildAuthPayload(customerUserId);

const updateCustomerProfile = async (customerUserId, payload) => {
  const customerUser = await db.CustomerUser.scope('withPassword').findByPk(customerUserId, {
    include: [
      {
        model: db.Customer,
        as: 'customer'
      }
    ]
  });

  if (!customerUser) {
    throw new AppError('Customer user not found.', 404);
  }

  await ensureUniqueCustomerUser({
    email: payload.email,
    phone: payload.phone,
    excludeId: customerUserId
  });

  await customerUser.update({
    first_name: payload.first_name ?? customerUser.first_name,
    last_name: payload.last_name ?? customerUser.last_name,
    email: payload.email ? normalizeEmail(payload.email) : customerUser.email,
    phone: payload.phone ? normalizePhone(payload.phone) : customerUser.phone,
    profile_image:
      payload.profile_image === undefined
        ? customerUser.profile_image
        : normalizeText(payload.profile_image) || null
  });

  return buildAuthPayload(customerUserId);
};

const changePassword = async (customerUserId, currentPassword, newPassword) => {
  const customerUser = await db.CustomerUser.scope('withPassword').findByPk(customerUserId);

  if (!customerUser) {
    throw new AppError('Customer user not found.', 404);
  }

  const isPasswordValid = await comparePassword(currentPassword, customerUser.password);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect.', 400);
  }

  await customerUser.update({ password: await hashPassword(newPassword) });
  await db.CustomerRefreshToken.destroy({
    where: {
      customer_user_id: customerUserId
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  sendOtp,
  resendOtp,
  verifyOtp,
  getCustomerProfile,
  updateCustomerProfile,
  changePassword
};
