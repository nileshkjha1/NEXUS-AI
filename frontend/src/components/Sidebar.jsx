import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Bot,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Headphones,
  FileText,
} from 'lucide-react';

export const Sidebar = ({ currentView, onViewChange }) => {
  const { user, isEmployee, isAgent, isAdmin, logout } = useAuth();

  const navItems = [
    // Employee & Shared Views
    ...(isEmployee
      ? [
          { id: 'employee-dashboard', label: 'My Portal', icon: LayoutDashboard },
          { id: 'create-ticket', label: 'Report Incident', icon: PlusCircle },
          { id: 'my-tickets', label: 'My Incidents', icon: Ticket },
        ]
      : []),

    // Support Agent Views
    ...(isAgent
      ? [
          { id: 'agent-dashboard', label: 'Agent Workbench', icon: Headphones },
          { id: 'create-ticket', label: 'New Ticket', icon: PlusCircle },
          { id: 'all-tickets', label: 'Incident Queue', icon: Ticket },
          { id: 'ai-assistant', label: 'AI Resolution Desk', icon: Bot },
        ]
      : []),

    // Administrator Views
    ...(isAdmin
      ? [
          { id: 'admin-dashboard', label: 'Admin Console', icon: Shield },
          { id: 'create-ticket', label: 'Create Incident', icon: PlusCircle },
          { id: 'all-tickets', label: 'All Incidents', icon: Ticket },
          { id: 'ai-assistant', label: 'AI Resolution Desk', icon: Bot },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'analytics', label: 'ITSM Analytics', icon: BarChart3 },
        ]
      : []),

    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
        }}>
          <Bot size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.02em', color: '#f8fafc' }}>
            NEXUS <span style={{ color: '#3b82f6' }}>AI</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
            ITSM & Incident Platform
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          color: 'var(--text-subtle)',
          letterSpacing: '0.06em',
          padding: '8px 12px 4px',
        }}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: isActive ? '#60a5fa' : 'var(--text-muted)',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(11, 15, 25, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#1e293b',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '13px',
            color: '#93c5fd',
          }}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.full_name || 'User'}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-subtle)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.role || 'Employee'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '7px 12px', fontSize: '12px' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
