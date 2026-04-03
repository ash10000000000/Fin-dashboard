import './Navbar.css';
import { useAuth } from '../context/AuthContext';

export function Navbar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <h1 className="navbar__title">{title}</h1>
      <div className="navbar__right">
        <span className="navbar__name">{user?.name}</span>
        <span className="navbar__badge">{user?.role}</span>
        <button type="button" className="navbar__logout" onClick={() => logout()}>
          Log out
        </button>
      </div>
    </header>
  );
}
