const recordModel = require('../models/record.model');

function ensureRecord(record) {
  if (!record) {
    const err = new Error('Record not found');
    err.status = 404;
    throw err;
  }
}

function listRecordsPaginated({ page, limit, filters }) {
  const { rows, total } = recordModel.listRecords({ page, limit, filters });
  const totalPages = Math.ceil(total / limit);
  return {
    data: rows,
    total,
    page,
    limit,
    totalPages,
  };
}

function getRecordById(id) {
  const record = recordModel.findActiveRecordById(Number(id));
  ensureRecord(record);
  return record;
}

function createRecord(payload, createdBy) {
  return recordModel.createRecord({
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    date: payload.date,
    notes: payload.notes ?? null,
    created_by: createdBy,
  });
}

function updateRecord(id, payload) {
  const existing = recordModel.findActiveRecordById(Number(id));
  ensureRecord(existing);
  const updated = recordModel.updateRecord(Number(id), payload);
  ensureRecord(updated);
  return updated;
}

function softDeleteRecord(id) {
  const existing = recordModel.findActiveRecordById(Number(id));
  ensureRecord(existing);
  const ok = recordModel.softDeleteRecord(Number(id));
  if (!ok) {
    const err = new Error('Record not found');
    err.status = 404;
    throw err;
  }
  return { id: Number(id), deleted: true };
}

module.exports = {
  listRecordsPaginated,
  getRecordById,
  createRecord,
  updateRecord,
  softDeleteRecord,
};
