import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { RoleGate } from './RoleGate';
import { SIDEBAR_WIDTH_PX, USER_ROLES } from '../constants';

export function Sidebar() {
  return (
    <aside className="sidebar" style={{ width: `${SIDEBAR_WIDTH_PX}px` }}>
      <div className="sidebar__brand">Finance Hub</div>
      <nav className="sidebar__nav">
        <NavLink to="/" className={navClass} end>
          <span className="sidebar__icon" aria-hidden>
            D
          </span>
          <span className="sidebar__label">Dashboard</span>
        </NavLink>
        <NavLink to="/transactions" className={navClass}>
          <span className="sidebar__icon" aria-hidden>
            T
          </span>
          <span className="sidebar__label">Transactions</span>
        </NavLink>
        <RoleGate roles={[USER_ROLES.ADMIN]}>
          <NavLink to="/users" className={navClass}>
            <span className="sidebar__icon" aria-hidden>
              U
            </span>
            <span className="sidebar__label">Users</span>
          </NavLink>
        </RoleGate>
      </nav>
    </aside>
  );
}

function navClass({ isActive }) {
  return isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link';
}
