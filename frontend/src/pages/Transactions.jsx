import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { TransactionTable } from '../components/TransactionTable';
import { Modal } from '../components/Modal';
import { RoleGate } from '../components/RoleGate';
import { TableSkeleton } from '../components/Skeleton';
import './Transactions.css';
import './PageLayout.css';
import { useTransactions } from '../hooks/useTransactions';
import { listRecords, createRecord, updateRecord, deleteRecord } from '../api/records';
import { getFieldErrorsFromResponse, getFirstApiMessage } from '../utils/parseApiErrors';
import { PAGINATION_DEFAULT_PAGE, PAGINATION_MAX_LIMIT, USER_ROLES } from '../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const emptyForm = {
  amount: '',
  type: 'income',
  category: '',
  date: '',
  notes: '',
};

function sanitizeAmount(value) {
  return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
}

function blockInvalidAmountKeys(e) {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
}

export function TransactionsPage() {
  useDocumentTitle('Transactions — FinanceApp');
  const { user } = useAuth();
  const { toast } = useToast();
  const tx = useTransactions();
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formFieldErrors, setFormFieldErrors] = useState({});
  const [optimisticRemovedIds, setOptimisticRemovedIds] = useState(() => new Set());

  useEffect(() => {
    tx.init();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      const collected = new Set();
      let page = PAGINATION_DEFAULT_PAGE;
      let totalPages = 1;
      do {
        const res = await listRecords({ page, limit: PAGINATION_MAX_LIMIT });
        if (cancelled) return;
        for (const r of res.data.data) {
          collected.add(r.category);
        }
        totalPages = res.data.totalPages;
        page += 1;
      } while (page <= totalPages);
      setCategories([...collected].sort());
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
    setFormFieldErrors({});
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row) => {
    setEditingId(row.id);
    setForm({
      amount: String(row.amount),
      type: row.type,
      category: row.category,
      date: row.date,
      notes: row.notes || '',
    });
    setFormFieldErrors({});
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setFormFieldErrors({});
  }, []);

  const saveRecord = useCallback(async () => {
    const trimmedCategory = form.category.trim();
    if (!trimmedCategory) {
      setFormFieldErrors({ category: 'Category cannot be empty.' });
      return;
    }
    const amountNum = Number.parseFloat(form.amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setFormFieldErrors({ amount: 'Enter a valid positive amount.' });
      return;
    }
    setSaving(true);
    setFormFieldErrors({});
    try {
      const payload = {
        amount: amountNum,
        type: form.type,
        category: trimmedCategory,
        date: form.date,
        notes: form.notes || null,
      };
      if (editingId) {
        await updateRecord(editingId, payload);
      } else {
        await createRecord(payload);
      }
      setModalOpen(false);
      await tx.reload();
      toast(editingId ? 'Record updated.' : 'Record created.', 'success');
    } catch (err) {
      const data = err.response?.data;
      setFormFieldErrors(getFieldErrorsFromResponse(data));
      const msg = getFirstApiMessage(data);
      if (msg) toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }, [editingId, form, tx.reload, toast]);

  const handleDelete = useCallback(
    async (row) => {
      const ok = window.confirm(`Delete record ${row.category} on ${row.date}?`);
      if (!ok) return;
      setOptimisticRemovedIds((prev) => new Set(prev).add(row.id));
      try {
        await deleteRecord(row.id);
        await tx.reload();
        toast('Record deleted.', 'success');
      } catch {
        setOptimisticRemovedIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
        toast('Could not delete record.', 'error');
      }
    },
    [tx.reload, toast]
  );

  const rawRows = tx.result?.data ?? [];
  const rows = useMemo(
    () => rawRows.filter((r) => !optimisticRemovedIds.has(r.id)),
    [rawRows, optimisticRemovedIds]
  );

  useEffect(() => {
    setOptimisticRemovedIds((prev) => {
      const next = new Set();
      for (const id of prev) {
        if (rawRows.some((r) => r.id === id)) next.add(id);
      }
      return next;
    });
  }, [rawRows]);

  const totalPages = tx.result?.totalPages ?? 0;

  return (
    <>
      <Navbar title="Transactions" />
      <div className="page-content">
        <div className="transactions-toolbar">
          <form
            className="filter-bar"
            onSubmit={(e) => {
              e.preventDefault();
              tx.applyFilters();
            }}
          >
            <label>
              Type
              <select
                value={tx.draftFilters.type}
                onChange={(e) =>
                  tx.setDraftFilters((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="">All</option>
                <option value="income">income</option>
                <option value="expense">expense</option>
              </select>
            </label>
            <label>
              Category
              <select
                value={tx.draftFilters.category}
                onChange={(e) =>
                  tx.setDraftFilters((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date from
              <input
                type="date"
                value={tx.draftFilters.date_from}
                onChange={(e) =>
                  tx.setDraftFilters((prev) => ({ ...prev, date_from: e.target.value }))
                }
              />
            </label>
            <label>
              Date to
              <input
                type="date"
                value={tx.draftFilters.date_to}
                onChange={(e) =>
                  tx.setDraftFilters((prev) => ({ ...prev, date_to: e.target.value }))
                }
              />
            </label>
            <label className="filter-bar__grow">
              Search
              <input
                type="search"
                value={tx.draftFilters.search}
                onChange={(e) =>
                  tx.setDraftFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </label>
            <button type="submit" className="btn-primary" disabled={tx.loading}>
              {tx.loading ? <span className="inline-spinner" aria-hidden /> : null}
              Apply filters
            </button>
          </form>
          <RoleGate roles={[USER_ROLES.ADMIN]}>
            <button type="button" className="btn-primary" onClick={openCreate}>
              Add record
            </button>
          </RoleGate>
        </div>

        {tx.error ? <p className="muted">Could not load records.</p> : null}

        {tx.loading ? (
          <TableSkeleton rows={10} cols={user?.role === USER_ROLES.ADMIN ? 6 : 5} />
        ) : (
          <TransactionTable
            rows={rows}
            showActions={user?.role === USER_ROLES.ADMIN}
            onEdit={openEdit}
            onDelete={handleDelete}
            loading={false}
          />
        )}

        <div className="pagination">
          <button
            type="button"
            className="btn-ghost"
            disabled={tx.page <= 1 || tx.loading}
            onClick={() => tx.goToPage(tx.page - 1)}
          >
            Previous
          </button>
          <span className="pagination__meta">
            Page {tx.page} of {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            className="btn-ghost"
            disabled={tx.page >= totalPages || tx.loading || totalPages === 0}
            onClick={() => tx.goToPage(tx.page + 1)}
          >
            Next
          </button>
          <label className="pagination__limit">
            Per page
            <select
              value={tx.limit}
              disabled={tx.loading}
              onChange={(e) => tx.changeLimit(Number(e.target.value))}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>

      <Modal
        title={editingId ? 'Edit record' : 'Add record'}
        isOpen={modalOpen}
        onClose={closeModal}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="button" className="btn-primary" disabled={saving} onClick={saveRecord}>
              {saving ? <span className="inline-spinner" aria-hidden /> : null}
              Save
            </button>
          </>
        }
      >
        <div className="form-grid">
          <label>
            Amount
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              required
              value={form.amount}
              onKeyDown={blockInvalidAmountKeys}
              onChange={(e) => setForm((p) => ({ ...p, amount: sanitizeAmount(e.target.value) }))}
            />
            {formFieldErrors.amount ? (
              <span className="field-error">{formFieldErrors.amount}</span>
            ) : null}
          </label>
          <label>
            Type
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
            {formFieldErrors.type ? <span className="field-error">{formFieldErrors.type}</span> : null}
          </label>
          <label>
            Category
            <input
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              required
            />
            {formFieldErrors.category ? (
              <span className="field-error">{formFieldErrors.category}</span>
            ) : null}
          </label>
          <label>
            Date
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
            {formFieldErrors.date ? <span className="field-error">{formFieldErrors.date}</span> : null}
          </label>
          <label className="form-grid__full">
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
            {formFieldErrors.notes ? <span className="field-error">{formFieldErrors.notes}</span> : null}
          </label>
        </div>
      </Modal>
    </>
  );
}
