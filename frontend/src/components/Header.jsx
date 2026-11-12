import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="top-header">
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          fontSize: '12px',
          color: '#34d399',
          fontWeight: '500',
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px #10b981',
          }} />
          <span>API Connected</span>
        </div>

        {/* User Role Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-card)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}>
          <ShieldCheck size={15} color="#3b82f6" />
          <span>{user?.department ? `${user.department} • ` : ''}{user?.role}</span>
        </div>
      </div>
    </header>
  );
};
