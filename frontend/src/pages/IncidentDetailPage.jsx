import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  Clock,
  User,
  Shield,
  MessageSquare,
  History,
  Send,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Lock,
  Sparkles,
} from 'lucide-react';

export const IncidentDetailPage = ({ ticketId, onBack }) => {
  const { user, isEmployee, isAgent, isAdmin } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assignee state
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchTicket = async () => {
    try {
      const data = await api.getTicket(ticketId);
      setTicket(data);
      setNewStatus(data.status);
      setSelectedAgentId(data.assigned_to_id || '');
    } catch (err) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (isAgent || isAdmin) {
      try {
        const supportUsers = await api.listUsers();
        const staff = supportUsers.filter(u => u.role === 'IT Support Agent' || u.role === 'Administrator');
        setAgents(staff);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      }
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchAgents();
  }, [ticketId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.addComment(ticketId, commentText, isInternalComment);
      setCommentText('');
      setIsInternalComment(false);
      await fetchTicket();
    } catch (err) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async () => {
    if (newStatus === 'Resolved' && !resolutionNotes.trim()) {
      alert('Please provide resolution notes before marking the ticket as Resolved.');
      return;
    }

    setUpdatingStatus(true);
    try {
      await api.updateTicketStatus(ticketId, newStatus, resolutionNotes);
      await fetchTicket();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAgentId) return;
    setAssigning(true);
    try {
      await api.assignTicket(ticketId, Number(selectedAgentId), 'Assigned from ticket workbench');
      await fetchTicket();
    } catch (err) {
      alert(err.message || 'Failed to assign ticket.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ticket ${ticket.ticket_number}?`)) {
      return;
    }
    try {
      await api.deleteTicket(ticketId);
      onBack();
    } catch (err) {
      alert(err.message || 'Failed to delete ticket.');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Loading Incident..." />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div>
        <Header title="Incident Error" />
        <div className="page-container">
          <div className="alert alert-error">{error || 'Ticket not found.'}</div>
          <button onClick={onBack} className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to Queue
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <Header
        title={`${ticket.ticket_number}: ${ticket.title}`}
        subtitle={`Reported by ${ticket.creator?.full_name || 'Employee'} • ${ticket.category} incident`}
      />

      <div className="page-container">
        {/* Navigation & Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={16} />
            <span>Back to Queue</span>
          </button>

          {isAdmin && (
            <button onClick={handleDelete} className="btn btn-danger" style={{ padding: '6px 12px' }}>
              <Trash2 size={15} />
              <span>Delete Ticket</span>
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Incident Details Card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '15px', color: '#60a5fa' }}>
                  {ticket.ticket_number}
                </span>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  color: 'var(--text-muted)',
                }}>
                  {ticket.category}
                </span>
              </div>

              <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>{ticket.title}</h2>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-main)',
                backgroundColor: 'rgba(11, 15, 25, 0.6)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {ticket.description}
              </div>

              {ticket.resolution_notes && (
                <div style={{
                  marginTop: '16px',
                  padding: '14px 18px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#34d399', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Resolution Notes
                  </div>
                  <div style={{ fontSize: '13px', color: '#ecfdf5' }}>
                    {ticket.resolution_notes}
                  </div>
                </div>
              )}
            </div>

            {/* AI Resolution Recommendations Banner */}
            <div className="card" style={{
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(24, 34, 52, 0.9) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Sparkles size={20} color="#60a5fa" />
                <h3 style={{ fontSize: '16px' }}>AI Incident Resolution Assistance</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                NEXUS AI automated resolution engine recommends troubleshooting procedures based on category <strong>{ticket.category}</strong> and similar historical incidents.
              </p>
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(11, 15, 25, 0.7)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-main)',
                marginBottom: '12px',
              }}>
                <div style={{ color: '#93c5fd', fontWeight: '600', marginBottom: '4px' }}>
                  Recommended Action Plan:
                </div>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Verify user authentication status and network connectivity to the target resource.</li>
                  <li>Inspect connection logs for timeouts, port blockage, or firewall policies.</li>
                  <li>Check active service health status in internal ITSM database before escalating.</li>
                </ul>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                * Human approval required: No destructive automated actions are taken without technician consent.
              </div>
            </div>

            {/* Comments & Activity Stream */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MessageSquare size={18} color="#3b82f6" />
                <h3 style={{ fontSize: '16px' }}>Discussion & Activity ({ticket.comments?.length || 0})</h3>
              </div>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {(!ticket.comments || ticket.comments.length === 0) ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                    No comments yet. Post an update below.
                  </div>
                ) : (
                  ticket.comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: c.is_internal ? 'rgba(245, 158, 11, 0.08)' : 'rgba(11, 15, 25, 0.5)',
                        border: c.is_internal ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)' }}>
                            {c.author?.full_name || 'Staff Member'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                            ({c.author?.role})
                          </span>
                          {c.is_internal && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '10px',
                              fontWeight: '600',
                              backgroundColor: 'rgba(245, 158, 11, 0.2)',
                              color: '#fbbf24',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}>
                              <Lock size={10} />
                              Internal Note
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                          {formatDate(c.created_at)}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {c.comment}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment}>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <textarea
                    rows={3}
                    required
                    className="form-control"
                    placeholder="Type an update or comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {(isAgent || isAdmin) ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                      />
                      <span>Mark as Internal Staff Note (hidden from employee)</span>
                    </label>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {submittingComment ? (
                      <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Post Comment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Audit History Timeline */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <History size={18} color="#3b82f6" />
                <h3 style={{ fontSize: '16px' }}>Incident History & Audit Trail</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(!ticket.history || ticket.history.length === 0) ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No historical edits recorded.</div>
                ) : (
                  ticket.history.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(11, 15, 25, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#93c5fd' }}>{h.changed_by?.full_name || 'System'}</strong> changed{' '}
                        <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{h.field_changed}</code>
                        {h.old_value && (
                          <span> from <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)' }}>{h.old_value}</span></span>
                        )}
                        {' '}to <strong style={{ color: '#34d399' }}>{h.new_value}</strong>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                        {formatDate(h.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Meta & Action Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status & Assignment Management (for Agents and Admins) */}
            {(isAgent || isAdmin) && (
              <div className="card">
                <h3 style={{ fontSize: '15px', marginBottom: '14px' }}>Ticket Controls</h3>

                {/* Status Update */}
                <div className="form-group">
                  <label className="form-label">Workflow Status</label>
                  <select
                    className="form-control"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {newStatus === 'Resolved' && (
                  <div className="form-group">
                    <label className="form-label">Resolution Summary *</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Explain how the incident was fixed..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStatusChange}
                  disabled={updatingStatus || newStatus === ticket.status}
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '16px', fontSize: '13px' }}
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '14px 0' }} />

                {/* Assignment Control */}
                <div className="form-group">
                  <label className="form-label">Assigned Agent</label>
                  <select
                    className="form-control"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.full_name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={assigning || Number(selectedAgentId) === ticket.assigned_to_id}
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  {assigning ? 'Assigning...' : 'Assign Incident'}
                </button>
              </div>
            )}

            {/* SLA & Time Tracking Card */}
            <div className="card">
              <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>SLA & Timing</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'var(--text-subtle)', fontSize: '11px', textTransform: 'uppercase' }}>Created</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: '500' }}>{formatDate(ticket.created_at)}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-subtle)', fontSize: '11px', textTransform: 'uppercase' }}>Target SLA Due Date</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: '600' }}>
                    <Clock size={14} />
                    <span>{formatDate(ticket.due_date)}</span>
                  </div>
                </div>

                {ticket.resolved_at && (
                  <div>
                    <div style={{ color: 'var(--text-subtle)', fontSize: '11px', textTransform: 'uppercase' }}>Resolved At</div>
                    <div style={{ color: '#10b981', fontWeight: '500' }}>{formatDate(ticket.resolved_at)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Requester Profile Card */}
            <div className="card">
              <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Requester Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  color: '#93c5fd',
                }}>
                  {ticket.creator?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{ticket.creator?.full_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ticket.creator?.email}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '6px' }}>
                Department: {ticket.creator?.department || 'General'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

