const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const {
  USER_ROLES,
  USER_STATUSES,
  BCRYPT_SALT_ROUNDS,
  HTTP_STATUS_CONFLICT,
} = require('../utils/constants');

function stripPassword(row) {
  return userModel.mapPublicUser(row);
}

async function register({ name, email, password }) {
  const existing = userModel.findUserByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = HTTP_STATUS_CONFLICT;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const created = userModel.createUser({
    name,
    email,
    passwordHash,
    role: USER_ROLES.VIEWER,
    status: USER_STATUSES.ACTIVE,
  });
  return stripPassword(created);
}

async function login({ email, password }) {
  const user = userModel.findUserByEmail(email);
  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  return stripPassword(user);
}

function getProfile(userId) {
  const user = userModel.findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return stripPassword(user);
}

module.exports = {
  register,
  login,
  getProfile,
};
