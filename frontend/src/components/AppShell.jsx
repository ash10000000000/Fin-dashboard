import { Outlet } from 'react-router-dom';
import './AppShell.css';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <Outlet />
      </div>
    </div>
  );
}
