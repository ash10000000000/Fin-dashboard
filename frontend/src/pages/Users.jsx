import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { UserTable } from '../components/UserTable';
import { Modal } from '../components/Modal';
import { RoleGate } from '../components/RoleGate';
import { TableSkeleton } from '../components/Skeleton';
import './Users.css';
import './PageLayout.css';
import './Transactions.css';
import { useToast } from '../context/ToastContext';
import { useUsers } from '../hooks/useUsers';
import { createUser, updateUser } from '../api/users';
import { getFieldErrorsFromResponse, getFirstApiMessage } from '../utils/parseApiErrors';
import { PAGINATION_DEFAULT_PAGE, USER_ROLES } from '../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  role: USER_ROLES.VIEWER,
};

export function UsersPage() {
  useDocumentTitle('Users — FinanceApp');
  const { toast } = useToast();
  const { load, page, loading, error, result } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyUserForm);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);
  const [createFieldErrors, setCreateFieldErrors] = useState({});

  useEffect(() => {
    load(PAGINATION_DEFAULT_PAGE);
  }, [load]);

  const rows = result?.data ?? [];

  useEffect(() => {
    if (rows.length === 0) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const u of rows) {
        if (!next[u.id]) {
          next[u.id] = { role: u.role, status: u.status };
        }
      }
      return next;
    });
  }, [rows]);

  const onDraftRole = useCallback((userId, role) => {
    setDrafts((d) => ({
      ...d,
      [userId]: { ...d[userId], role },
    }));
  }, []);

  const onDraftStatus = useCallback((userId, status) => {
    setDrafts((d) => ({
      ...d,
      [userId]: { ...d[userId], status },
    }));
  }, []);

  const onCancel = useCallback((u) => {
    setDrafts((d) => ({
      ...d,
      [u.id]: { role: u.role, status: u.status },
    }));
  }, []);

  const onSave = useCallback(
    async (u) => {
      const d = drafts[u.id];
      if (!d) return;
      setSavingUserId(u.id);
      try {
        const body = {};
        if (d.role !== u.role) body.role = d.role;
        if (d.status !== u.status) body.status = d.status;
        await updateUser(u.id, body);
        await load(page);
        toast('User updated.', 'success');
      } catch (err) {
        const msg = getFirstApiMessage(err.response?.data) || 'Update failed.';
        toast(msg, 'error');
      } finally {
        setSavingUserId(null);
      }
    },
    [drafts, load, page, toast]
  );

  const create = useCallback(async () => {
    setSaving(true);
    setCreateFieldErrors({});
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setModalOpen(false);
      setForm(emptyUserForm);
      await load(PAGINATION_DEFAULT_PAGE);
      toast('User created.', 'success');
    } catch (err) {
      const data = err.response?.data;
      setCreateFieldErrors(getFieldErrorsFromResponse(data));
      const msg = getFirstApiMessage(data);
      if (msg) toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }, [form, load, toast]);

  return (
    <>
      <Navbar title="Users" />
      <div className="page-content users-page">
        <div className="users-toolbar">
          <RoleGate roles={[USER_ROLES.ADMIN]}>
            <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
              Create user
            </button>
          </RoleGate>
        </div>
        {error ? <p className="muted">Could not load users.</p> : null}
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <UserTable
            users={rows}
            drafts={drafts}
            onDraftRole={onDraftRole}
            onDraftStatus={onDraftStatus}
            onSave={onSave}
            onCancel={onCancel}
            savingUserId={savingUserId}
            loading={false}
          />
        )}

        <Modal
          title="Create user"
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setCreateFieldErrors({});
          }}
          footer={
            <>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setModalOpen(false);
                  setCreateFieldErrors({});
                }}
              >
                Cancel
              </button>
              <button type="button" className="btn-primary" disabled={saving} onClick={create}>
                {saving ? <span className="inline-spinner" aria-hidden /> : null}
                Save
              </button>
            </>
          }
        >
          <div className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              {createFieldErrors.name ? (
                <span className="field-error">{createFieldErrors.name}</span>
              ) : null}
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
              {createFieldErrors.email ? (
                <span className="field-error">{createFieldErrors.email}</span>
              ) : null}
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={8}
              />
              {createFieldErrors.password ? (
                <span className="field-error">{createFieldErrors.password}</span>
              ) : null}
            </label>
            <label>
              Role
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value={USER_ROLES.VIEWER}>{USER_ROLES.VIEWER}</option>
                <option value={USER_ROLES.ANALYST}>{USER_ROLES.ANALYST}</option>
                <option value={USER_ROLES.ADMIN}>{USER_ROLES.ADMIN}</option>
              </select>
              {createFieldErrors.role ? (
                <span className="field-error">{createFieldErrors.role}</span>
              ) : null}
            </label>
          </div>
        </Modal>
      </div>
    </>
  );
}
