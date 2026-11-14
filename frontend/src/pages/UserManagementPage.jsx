import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { Users, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUser(userId, { role: newRole });
      setSuccess('User role updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.updateUser(user.id, { is_active: !user.is_active });
      setSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully.`);
      setTimeout(() => setSuccess(''), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to toggle user status.');
    }
  };

  return (
    <div>
      <Header
        title="User & Access Management"
        subtitle="Manage employee and agent identities, organizational roles, and permissions"
      />

      <div className="page-container">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '16px' }}>Directory ({users.length} Users)</h3>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="table-responsive-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="cell-wrap" style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.full_name}</td>
                      <td className="cell-wrap" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>{u.department || 'General'}</td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '12px', width: '160px' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="Employee">Employee</option>
                          <option value="IT Support Agent">IT Support Agent</option>
                          <option value="Administrator">Administrator</option>
                        </select>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: u.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.is_active ? '#34d399' : '#f87171',
                        }}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={u.is_active ? 'btn btn-danger' : 'btn btn-secondary'}
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

