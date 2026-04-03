import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../context/AuthContext';
import { LOGIN_CARD_WIDTH_PX } from '../constants';

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
    } catch {
      setError('Invalid email or password.');
    }
  }

  return (
    <div className="login-page">
      <form
        className="login-card"
        style={{ width: `${LOGIN_CARD_WIDTH_PX}px` }}
        onSubmit={handleSubmit}
      >
        <h1 className="login-card__title">Sign in</h1>
        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="login-submit">
          Sign in
        </button>
        {error ? <p className="login-error">{error}</p> : null}
      </form>
    </div>
  );
}
