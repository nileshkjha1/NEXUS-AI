import React, { useState } from 'react';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { PlusCircle, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const CreateIncidentPage = ({ onIncidentCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    priority: 'Medium',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const ticket = await api.createTicket(formData);
      setSuccess(`Incident ${ticket.ticket_number} logged successfully!`);
      setTimeout(() => {
        if (onIncidentCreated) {
          onIncidentCreated(ticket.id);
        }
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to submit incident.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Report New Incident"
        subtitle="Submit a technical issue to the IT operations desk"
      />

      <div className="page-container" style={{ maxWidth: '860px' }}>
        <div className="card">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* AI Helper Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '14px 18px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
          }}>
            <Sparkles size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#93c5fd', lineHeight: 1.5 }}>
              <strong>AI Incident Intelligence:</strong> Upon submission, NEXUS AI will automatically analyze your issue, verify SLA windows, and query the vector troubleshooting knowledge base to assist IT technicians.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Incident Summary / Title *</label>
              <input
                type="text"
                name="title"
                required
                minLength={5}
                className="form-control"
                placeholder="e.g. Cannot access PostgreSQL database over VPN tunnel"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Network">Network</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Database">Database</option>
                  <option value="Security">Security</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Application">Application</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Urgency / Priority</label>
                <select
                  name="priority"
                  className="form-control"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low (Non-critical, single user)</option>
                  <option value="Medium">Medium (Standard business workflow)</option>
                  <option value="High">High (Impacting multiple users / team)</option>
                  <option value="Critical">Critical (Total system downtime / security breach)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Problem Description *</label>
              <textarea
                name="description"
                required
                minLength={10}
                rows={6}
                className="form-control"
                placeholder="Describe what occurred, any error messages displayed, and steps you already tried..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                {loading ? (
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                ) : (
                  <>
                    <PlusCircle size={16} />
                    <span>Create Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
