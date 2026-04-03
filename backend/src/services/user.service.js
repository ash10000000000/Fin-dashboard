const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const {
  BCRYPT_SALT_ROUNDS,
  USER_STATUSES,
  HTTP_STATUS_CONFLICT,
} = require('../utils/constants');

function stripPassword(row) {
  return userModel.mapPublicUser(row);
}

function ensureFound(user) {
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
}

async function createUserAdmin(payload) {
  const existing = userModel.findUserByEmail(payload.email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = HTTP_STATUS_CONFLICT;
    throw err;
  }
  const passwordHash = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
  const created = userModel.createUser({
    name: payload.name,
    email: payload.email,
    passwordHash,
    role: payload.role,
    status: USER_STATUSES.ACTIVE,
  });
  return stripPassword(created);
}

function listUsersPaginated({ page, limit }) {
  const { rows, total } = userModel.listUsers({ page, limit });
  const totalPages = Math.ceil(total / limit);
  return {
    data: rows.map((r) => stripPassword(r)),
    total,
    page,
    limit,
    totalPages,
  };
}

function getUserById(id) {
  const user = userModel.findUserById(Number(id));
  ensureFound(user);
  return stripPassword(user);
}

function updateUserAdmin(id, fields) {
  const user = userModel.findUserById(Number(id));
  ensureFound(user);
  const updated = userModel.updateUser(Number(id), fields);
  return stripPassword(updated);
}

function deactivateUser(id) {
  const user = userModel.findUserById(Number(id));
  ensureFound(user);
  const updated = userModel.updateUser(Number(id), { status: USER_STATUSES.INACTIVE });
  return stripPassword(updated);
}

module.exports = {
  createUserAdmin,
  listUsersPaginated,
  getUserById,
  updateUserAdmin,
  deactivateUser,
};
