const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcrypt');
const { validateConfig } = require('./src/config');
const { getDb, closeDb } = require('./db');
const {
  BCRYPT_SALT_ROUNDS,
  SEED_DEMO_PLAINTEXT_PASSWORD,
  USER_STATUSES,
  USER_ROLES,
  RECORD_TYPES,
  SEED_FINANCIAL_RECORDS_COUNT,
} = require('./src/utils/constants');

const SEED_USERS = [
  { name: 'Admin User', email: 'admin@example.com', role: USER_ROLES.ADMIN },
  { name: 'Analyst User', email: 'analyst@example.com', role: USER_ROLES.ANALYST },
  { name: 'Viewer User', email: 'viewer@example.com', role: USER_ROLES.VIEWER },
];

const BULK_CATEGORIES = [
  'Salary',
  'Freelance',
  'Utilities',
  'Dining',
  'Software',
  'Rent',
  'Marketing',
  'Insurance',
  'Travel',
  'Equipment',
];

const INCOME_NOTE_POOL = ['Monthly pay', 'Client invoice', 'Bonus', 'Reimbursement', null];
const EXPENSE_NOTE_POOL = ['Vendor', 'Subscription', 'Annual renewal', 'One-time', null];

function isoDateUtc(year, monthIndex, day) {
  const d = new Date(Date.UTC(year, monthIndex, day));
  return d.toISOString().slice(0, 10);
}

async function seed() {
  validateConfig();
  const db = getDb();
  const passwordHash = await bcrypt.hash(SEED_DEMO_PLAINTEXT_PASSWORD, BCRYPT_SALT_ROUNDS);

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, password, role, status)
     VALUES (@name, @email, @password, @role, @status)`
  );

  const insertRecord = db.prepare(
    `INSERT INTO financial_records (amount, type, category, date, notes, created_by)
     VALUES (@amount, @type, @category, @date, @notes, @created_by)`
  );

  for (const u of SEED_USERS) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
    if (existing) continue;
    insertUser.run({
      name: u.name,
      email: u.email,
      password: passwordHash,
      role: u.role,
      status: USER_STATUSES.ACTIVE,
    });
  }

  const adminRow =
    db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com') ||
    db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get(USER_ROLES.ADMIN);

  db.prepare('DELETE FROM financial_records').run();

  const adminId = adminRow.id;

  const bulk = db.transaction(() => {
    const baseYear = new Date().getUTCFullYear();
    for (let i = 0; i < SEED_FINANCIAL_RECORDS_COUNT; i += 1) {
      const monthSpread = i % 10;
      const day = 1 + ((i * 3) % 27);
      const monthIndex = (new Date().getUTCMonth() - monthSpread + 12) % 12;
      const yearOffset = Math.floor((new Date().getUTCMonth() - monthSpread) / 12);
      const year = baseYear + yearOffset;
      const date = isoDateUtc(year, monthIndex, day);
      const type = i % 3 === 0 ? RECORD_TYPES.INCOME : RECORD_TYPES.EXPENSE;
      const category = BULK_CATEGORIES[i % BULK_CATEGORIES.length];
      const amount = Math.round((25 + (i % 50) * 47.5 + (i % 7) * 12) * 100) / 100;
      const notes =
        type === RECORD_TYPES.INCOME
          ? INCOME_NOTE_POOL[i % INCOME_NOTE_POOL.length]
          : EXPENSE_NOTE_POOL[i % EXPENSE_NOTE_POOL.length];
      insertRecord.run({
        amount,
        type,
        category,
        date,
        notes,
        created_by: adminId,
      });
    }
  });
  bulk();

  closeDb();
}

seed().catch(() => {
  process.exitCode = 1;
  closeDb();
});
