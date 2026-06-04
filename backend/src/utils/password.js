const bcrypt = require('bcrypt');

const HASH_ROUNDS = 10;

const hashPassword = (value) => bcrypt.hash(value, HASH_ROUNDS);

const comparePassword = (plainText, hash) => bcrypt.compare(plainText, hash);

module.exports = {
  hashPassword,
  comparePassword
};
