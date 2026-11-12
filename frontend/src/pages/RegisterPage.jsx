import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';

export const RegisterPage = ({ onNavigateLogin }) => {
  const { register, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'Employee',
    department: 'Engineering',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      // Auto login after successful registration
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify input data.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)',
      background: 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.08) 0%, rgba(11, 15, 25, 1) 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <Bot size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700' }}>Create NEXUS AI Account</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Join the automated IT service resolution platform
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="full_name"
                required
                className="form-control"
                placeholder="Jane Doe"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="jane@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min 8 characters)</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Employee">Employee</option>
                  <option value="IT Support Agent">IT Support Agent</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  placeholder="e.g. Sales, DevOps"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '10px 16px' }}
            >
              {loading ? (
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Register & Sign In</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              style={{ background: 'none', color: '#3b82f6', fontWeight: '600' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

