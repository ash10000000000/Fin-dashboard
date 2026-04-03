const { getDb } = require('../../db');

function mapPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function createUser({ name, email, passwordHash, role, status }) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO users (name, email, password, role, status)
     VALUES (@name, @email, @password, @role, @status)`
  );
  const result = stmt.run({
    name,
    email,
    password: passwordHash,
    role,
    status,
  });
  return findUserById(result.lastInsertRowid);
}

function findUserByEmail(email) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
}

function findUserById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
}

function listUsers({ page, limit }) {
  const db = getDb();
  const offset = (page - 1) * limit;
  const rows = db
    .prepare(
      `SELECT id, name, email, role, status, created_at, updated_at
       FROM users
       ORDER BY id ASC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset);
  const { total } = db.prepare('SELECT COUNT(*) as total FROM users').get();
  return { rows, total };
}

function updateUser(id, fields) {
  const db = getDb();
  const allowed = ['name', 'role', 'status'];
  const assignments = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
      assignments.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (assignments.length === 0) {
    return findUserById(id);
  }
  assignments.push('updated_at = datetime(\'now\')');
  const sql = `UPDATE users SET ${assignments.join(', ')} WHERE id = ?`;
  values.push(id);
  db.prepare(sql).run(...values);
  return findUserById(id);
}

module.exports = {
  mapPublicUser,
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUser,
};
