import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: 'admin', password: 'Admin@123' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-block">
          <h1>MENDI HEALTH CENTER</h1>
          <small>Hospital Payroll Management System</small>
        </div>

        <form onSubmit={handleSubmit} className="stacked-form">
          <label>
            Username
            <input name="username" value={form.username} onChange={handleChange} />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
