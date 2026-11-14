import React, { useState, useEffect } from 'react';
import { ShieldCheck, Bell, Check, ExternalLink, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Header = ({ title, subtitle }) => {
  const { user, toggleSidebar } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications(false, 10);
      setNotifications(data.items || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      // Non-critical, ignore if offline or unauthenticated
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  return (
    <header className="top-header">
      <div className="header-content-wrap">
        <button
          type="button"
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle navigation drawer"
          title="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-titles">
          <h2 className="header-title-text">
            {title}
          </h2>
          {subtitle && (
            <p className="header-subtitle-text">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="header-right-actions">
        {/* System Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 10px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          fontSize: '12px',
          color: '#34d399',
          fontWeight: '500',
          whiteSpace: 'nowrap',
        }} title="Backend API Connected">
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px #10b981',
            flexShrink: 0,
          }} />
          <span className="header-status-text">API Connected</span>
        </div>

        {/* Notifications Bell Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            title="Notifications"
            aria-label="View notifications"
            style={{
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '7px 9px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              minHeight: '36px',
            }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                borderRadius: '9999px',
                padding: '1px 5px',
                minWidth: '16px',
                textAlign: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className="notifications-dropdown">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-blue)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 14px',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.06)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: n.is_read ? 'var(--text-muted)' : 'var(--text-main)' }}>
                          {n.title}
                        </div>
                        {!n.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            title="Mark as read"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-blue)',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-subtle)', marginTop: '6px' }}>
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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


