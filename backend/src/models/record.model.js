const { getDb } = require('../../db');
const {
  DASHBOARD_RECENT_ACTIVITY_LIMIT,
  TREND_MONTHS_LOOKBACK,
  TREND_WEEKS_LOOKBACK,
  RECORD_TYPES,
} = require('../utils/constants');
const {
  padMonth,
  formatMonthLabel,
  startOfUtcDay,
  addUtcDays,
  startOfIsoWeekUtc,
} = require('../utils/dateUtils');

function mapRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    amount: row.amount,
    type: row.type,
    category: row.category,
    date: row.date,
    notes: row.notes,
    deleted_at: row.deleted_at,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function createRecord(payload) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO financial_records (amount, type, category, date, notes, created_by)
     VALUES (@amount, @type, @category, @date, @notes, @created_by)`
  );
  const result = stmt.run(payload);
  return findActiveRecordById(result.lastInsertRowid);
}

function findActiveRecordById(id) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM financial_records
       WHERE id = ? AND deleted_at IS NULL`
    )
    .get(id);
  return mapRecord(row);
}

function findRecordByIdIncludingDeleted(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM financial_records WHERE id = ?').get(id);
  return mapRecord(row);
}

function buildListWhereClause(filters) {
  const conditions = ['deleted_at IS NULL'];
  const params = [];
  if (filters.type) {
    conditions.push('type = ?');
    params.push(filters.type);
  }
  if (filters.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  if (filters.date_from) {
    conditions.push('date >= ?');
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    conditions.push('date <= ?');
    params.push(filters.date_to);
  }
  if (filters.search) {
    conditions.push('(category LIKE ? ESCAPE \'\\\' OR notes LIKE ? ESCAPE \'\\\')');
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&');
    const like = `%${escaped}%`;
    params.push(like, like);
  }
  return { whereSql: conditions.join(' AND '), params };
}

function listRecords({ page, limit, filters }) {
  const db = getDb();
  const { whereSql, params } = buildListWhereClause(filters);
  const offset = (page - 1) * limit;
  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM financial_records WHERE ${whereSql}`)
    .get(...params);
  const rows = db
    .prepare(
      `SELECT * FROM financial_records
       WHERE ${whereSql}
       ORDER BY date DESC, id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);
  return {
    rows: rows.map((r) => mapRecord(r)),
    total: countRow.total,
  };
}

function updateRecord(id, fields) {
  const db = getDb();
  const allowed = ['amount', 'type', 'category', 'date', 'notes'];
  const assignments = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
      assignments.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (assignments.length === 0) {
    return findActiveRecordById(id);
  }
  assignments.push('updated_at = datetime(\'now\')');
  const sql = `UPDATE financial_records SET ${assignments.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
  values.push(id);
  const result = db.prepare(sql).run(...values);
  if (result.changes === 0) {
    return null;
  }
  return findActiveRecordById(id);
}

function softDeleteRecord(id) {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE financial_records
       SET deleted_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ? AND deleted_at IS NULL`
    )
    .run(id);
  return result.changes > 0;
}

function getTotals() {
  const db = getDb();
  const income = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as t
       FROM financial_records
       WHERE deleted_at IS NULL AND type = ?`
    )
    .get(RECORD_TYPES.INCOME).t;
  const expenses = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as t
       FROM financial_records
       WHERE deleted_at IS NULL AND type = ?`
    )
    .get(RECORD_TYPES.EXPENSE).t;
  const totalRecords = db
    .prepare('SELECT COUNT(*) as c FROM financial_records WHERE deleted_at IS NULL')
    .get().c;
  return {
    totalIncome: income,
    totalExpenses: expenses,
    netBalance: income - expenses,
    totalRecords,
  };
}

function getRecentActivity(limit = DASHBOARD_RECENT_ACTIVITY_LIMIT) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, amount, type, category, date, notes, created_at
       FROM financial_records
       WHERE deleted_at IS NULL
       ORDER BY date DESC, id DESC
       LIMIT ?`
    )
    .all(limit);
  return rows;
}

function getCategoryBreakdown() {
  const db = getDb();
  return db
    .prepare(
      `SELECT category, type, SUM(amount) as total
       FROM financial_records
       WHERE deleted_at IS NULL
       GROUP BY category, type
       ORDER BY category ASC, type ASC`
    )
    .all();
}

function padDay(day) {
  return day < 10 ? `0${day}` : String(day);
}

function sumByTypeInRange(startIso, endIso, recordType) {
  const db = getDb();
  return db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as t
       FROM financial_records
       WHERE deleted_at IS NULL AND type = ? AND date >= ? AND date <= ?`
    )
    .get(recordType, startIso, endIso).t;
}

function getMonthlyTrends() {
  const now = new Date();
  const results = [];
  for (let i = TREND_MONTHS_LOOKBACK - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const year = d.getUTCFullYear();
    const monthIndex = d.getUTCMonth();
    const start = `${year}-${padMonth(monthIndex)}-01`;
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const end = `${year}-${padMonth(monthIndex)}-${padDay(lastDay)}`;
    const income = sumByTypeInRange(start, end, RECORD_TYPES.INCOME);
    const expenses = sumByTypeInRange(start, end, RECORD_TYPES.EXPENSE);
    results.push({
      label: formatMonthLabel(year, monthIndex),
      income,
      expenses,
    });
  }
  return results;
}

function getWeeklyTrends() {
  const now = startOfUtcDay(new Date());
  const startWeek = startOfIsoWeekUtc(now);
  const results = [];
  for (let i = TREND_WEEKS_LOOKBACK - 1; i >= 0; i -= 1) {
    const weekStart = addUtcDays(startWeek, -7 * i);
    const weekEnd = addUtcDays(weekStart, 6);
    const startIso = weekStart.toISOString().slice(0, 10);
    const endIso = weekEnd.toISOString().slice(0, 10);
    const income = sumByTypeInRange(startIso, endIso, RECORD_TYPES.INCOME);
    const expenses = sumByTypeInRange(startIso, endIso, RECORD_TYPES.EXPENSE);
    const label = `${startIso} — ${endIso}`;
    results.push({ label, income, expenses });
  }
  return results;
}

module.exports = {
  createRecord,
  findActiveRecordById,
  findRecordByIdIncludingDeleted,
  listRecords,
  updateRecord,
  softDeleteRecord,
  getTotals,
  getRecentActivity,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
};
