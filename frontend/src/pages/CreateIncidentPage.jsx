import React, { useState } from 'react';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { PlusCircle, AlertCircle, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export const CreateIncidentPage = ({ onIncidentCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    priority: 'Medium',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [triaging, setTriaging] = useState(false);
  const [triageSuggestion, setTriageSuggestion] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutoTriage = async () => {
    if (!formData.title && !formData.description) {
      setError('Please provide at least a summary or description for AI classification.');
      return;
    }
    setError('');
    setTriaging(true);

    try {
      const result = await api.mlTriage(formData.title, formData.description);
      setTriageSuggestion(result);
    } catch (err) {
      console.error('Triage failed:', err);
    } finally {
      setTriaging(false);
    }
  };

  const applySuggestion = () => {
    if (triageSuggestion) {
      setFormData(prev => ({
        ...prev,
        category: triageSuggestion.predicted_category,
        priority: triageSuggestion.predicted_priority,
      }));
      setTriageSuggestion(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const ticket = await api.createTicket(formData);
      setSuccess(`Incident ${ticket.ticket_number} logged successfully! Category: ${ticket.category}`);
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
          <div className="ai-banner-responsive">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '13px', color: '#93c5fd', lineHeight: 1.5 }}>
                <strong>ML-Powered Triage:</strong> NEXUS AI automatically classifies technical categories and evaluates SLA urgency.
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoTriage}
              disabled={triaging || (!formData.title && !formData.description)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', flexShrink: 0, borderColor: '#3b82f6' }}
            >
              <Zap size={14} color="#60a5fa" />
              <span>{triaging ? 'Classifying...' : 'AI Auto-Triage'}</span>
            </button>
          </div>

          {/* AI Triage Suggestion Banner */}
          {triageSuggestion && (
            <div className="suggestion-banner-responsive">
              <div>
                <span style={{ color: '#34d399', fontWeight: '600' }}>ML Prediction: </span>
                <span>Category: <strong>{triageSuggestion.predicted_category}</strong> ({(triageSuggestion.category_confidence * 100).toFixed(0)}%) • Priority: <strong>{triageSuggestion.predicted_priority}</strong> ({(triageSuggestion.priority_confidence * 100).toFixed(0)}%)</span>
              </div>
              <button
                type="button"
                onClick={applySuggestion}
                className="btn btn-primary"
                style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: '#10b981', flexShrink: 0 }}
              >
                Apply Suggestion
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Incident Summary / Title *</label>
              <input
                type="text"
                name="title"
                required
                minLength={5}
                className="form-control"
                placeholder="e.g. Cannot access PostgreSQL production database over VPN tunnel"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="grid-form-2col">
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
                placeholder="Describe what occurred, error codes displayed, and troubleshooting steps already attempted..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="card-actions-responsive" style={{ marginTop: '24px' }}>
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
