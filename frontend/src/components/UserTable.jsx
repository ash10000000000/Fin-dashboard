import './UserTable.css';
import { USER_ROLES, USER_STATUSES } from '../constants';

export function UserTable({
  users,
  drafts,
  onDraftRole,
  onDraftStatus,
  onSave,
  onCancel,
  savingUserId,
  loading,
}) {
  if (loading) {
    return null;
  }

  if (users.length === 0) {
    return (
      <div className="user-table-empty">
        <p>
          <strong>No users found.</strong>
        </p>
        <p className="user-table-empty__hint">Create a user with the button above.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th className="data-table__actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const d = drafts[u.id] || { role: u.role, status: u.status };
            const dirty = d.role !== u.role || d.status !== u.status;
            const saving = savingUserId === u.id;
            return (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    className="inline-select"
                    value={d.role}
                    disabled={saving}
                    onChange={(e) => onDraftRole(u.id, e.target.value)}
                    aria-label={`Role for ${u.name}`}
                  >
                    <option value={USER_ROLES.VIEWER}>{USER_ROLES.VIEWER}</option>
                    <option value={USER_ROLES.ANALYST}>{USER_ROLES.ANALYST}</option>
                    <option value={USER_ROLES.ADMIN}>{USER_ROLES.ADMIN}</option>
                  </select>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={d.status === USER_STATUSES.ACTIVE}
                      disabled={saving}
                      onChange={() =>
                        onDraftStatus(
                          u.id,
                          d.status === USER_STATUSES.ACTIVE
                            ? USER_STATUSES.INACTIVE
                            : USER_STATUSES.ACTIVE
                        )
                      }
                      aria-label={`Status for ${u.name}`}
                    />
                    <span className="switch__ui" />
                    <span className="switch__text">{d.status}</span>
                  </label>
                </td>
                <td className="user-table__actions">
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--compact"
                    disabled={!dirty || saving}
                    onClick={() => onSave(u)}
                  >
                    {saving ? <span className="inline-spinner" aria-hidden /> : null}
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--compact"
                    disabled={!dirty || saving}
                    onClick={() => onCancel(u)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
