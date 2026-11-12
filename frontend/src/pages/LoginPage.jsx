import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, LogIn, AlertCircle, ArrowRight, Shield, User, Headphones } from 'lucide-react';

export const LoginPage = ({ onNavigateRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
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
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          }}>
            <Bot size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            NEXUS <span style={{ color: '#3b82f6' }}>AI</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Enterprise ITSM & Automated Incident Resolution
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Sign in to your account</h2>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600', marginBottom: '10px' }}>
              Quick Demo Accounts (1-Click Fill):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillQuickLogin('admin@nexusai.com', 'Admin@123456')}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '6px 8px' }}
                title="Admin: Full System Access"
              >
                <Shield size={12} color="#3b82f6" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickLogin('agent@nexusai.com', 'Agent@123456')}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '6px 8px' }}
                title="Support Agent: Manage Queues"
              >
                <Headphones size={12} color="#10b981" />
                <span>Agent</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickLogin('employee@nexusai.com', 'Employee@123456')}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '6px 8px' }}
                title="Employee: Submit & View Own"
              >
                <User size={12} color="#f59e0b" />
                <span>Employee</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              style={{ background: 'none', color: '#3b82f6', fontWeight: '600' }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
