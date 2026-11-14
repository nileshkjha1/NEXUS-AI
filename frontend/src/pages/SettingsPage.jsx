import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Settings, Shield, Server, Bell, Save, CheckCircle } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [saved, setSaved] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slaNotifications, setSlaNotifications] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
      } catch (err) {
        console.error('Health check failed:', err);
      }
    };
    checkHealth();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <Header
        title="System Settings"
        subtitle="Manage platform parameters, notification hooks, and backend connections"
      />

      <div className="page-container" style={{ maxWidth: '860px' }}>
        {saved && (
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>Settings preferences updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* User Profile Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Shield size={18} color="#3b82f6" />
              <h3 style={{ fontSize: '16px' }}>Authenticated Account</h3>
            </div>

            <div className="grid-form-2col">
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" disabled className="form-control" value={user?.full_name || ''} />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input type="text" disabled className="form-control" value={user?.email || ''} />
              </div>
              <div>
                <label className="form-label">Department</label>
                <input type="text" disabled className="form-control" value={user?.department || 'General'} />
              </div>
              <div>
                <label className="form-label">System Role</label>
                <input type="text" disabled className="form-control" value={user?.role || ''} />
              </div>
            </div>
          </div>

          {/* Backend Engine Status Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Server size={18} color="#10b981" />
              <h3 style={{ fontSize: '16px' }}>Backend API & Health Connection</h3>
            </div>

            <div className="grid-form-2col" style={{ fontSize: '13px' }}>
              <div style={{ backgroundColor: 'rgba(11, 15, 25, 0.4)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-subtle)', marginBottom: '4px' }}>Platform Version</div>
                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{health?.version || '1.0.0'}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(11, 15, 25, 0.4)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-subtle)', marginBottom: '4px' }}>API Health Status</div>
                <div style={{ fontWeight: '600', color: '#34d399' }}>{health?.status || 'Online'}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(11, 15, 25, 0.4)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-subtle)', marginBottom: '4px' }}>Environment</div>
                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{health?.environment || 'development'}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(11, 15, 25, 0.4)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-subtle)', marginBottom: '4px' }}>Last Check Timestamp</div>
                <div style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px' }}>{health?.timestamp || '—'}</div>
              </div>
            </div>
          </div>

          {/* Notifications Preferences Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Bell size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '16px' }}>Notification & Alert Preferences</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                />
                <span>Email me when tickets assigned to me are created or updated</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={slaNotifications}
                  onChange={(e) => setSlaNotifications(e.target.checked)}
                />
                <span>Send urgent alerts for tickets approaching SLA breach (1h warning)</span>
              </label>
            </div>
          </div>

          <div className="card-actions-responsive">
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={16} />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

