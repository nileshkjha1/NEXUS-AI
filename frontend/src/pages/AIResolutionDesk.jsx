import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  Bot,
  Sparkles,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  History,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const AIResolutionDesk = () => {
  const { user, isAgent, isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [similarCases, setSimilarCases] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await api.listTickets({ size: 50 });
        const list = data.items || [];
        setTickets(list);
        if (list.length > 0) {
          setSelectedTicketId(list[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
      }
    };
    loadTickets();
  }, []);

  const handleGenerateRecommendation = async () => {
    if (!selectedTicketId) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setRecommendation(null);
    setSimilarCases([]);

    try {
      // 1. Trigger live RAG pipeline
      const rec = await api.generateAIRecommendation(Number(selectedTicketId));
      setRecommendation(rec);

      // 2. Fetch similar historical incidents
      try {
        const similar = await api.getSimilarIncidents(Number(selectedTicketId));
        setSimilarCases(similar || []);
      } catch (simErr) {
        console.warn('Could not fetch similar incidents:', simErr);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate resolution recommendation.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (newStatus) => {
    if (!recommendation?.recommendation_id) return;
    setReviewing(true);
    setError('');

    try {
      await api.reviewAIRecommendation(
        recommendation.recommendation_id,
        newStatus,
        `Reviewed by ${user?.full_name}`,
        newStatus === 'Approved' // auto-apply to ticket if approved
      );
      setSuccess(`Recommendation successfully marked as ${newStatus}!`);
      setRecommendation(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setReviewing(false);
    }
  };

  const selectedTicket = tickets.find(t => t.id.toString() === selectedTicketId);

  return (
    <div>
      <Header
        title="AI Incident Resolution Desk"
        subtitle="Retrieval-Augmented Generation (RAG) assistant for grounded root-cause analysis & remediation"
      />

      <div className="page-container">
        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Ticket Selector Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Bot size={20} color="#3b82f6" />
            <h3 style={{ fontSize: '16px' }}>Select Target Incident for AI Investigation</h3>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <label className="form-label">Active Ticket</label>
              <select
                className="form-control"
                value={selectedTicketId}
                onChange={(e) => {
                  setSelectedTicketId(e.target.value);
                  setRecommendation(null);
                  setSimilarCases([]);
                }}
              >
                {tickets.length === 0 ? (
                  <option value="">No tickets found</option>
                ) : (
                  tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.ticket_number}: {t.title} ({t.category} • {t.priority})
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={handleGenerateRecommendation}
              disabled={loading || !selectedTicketId}
              className="btn btn-primary"
              style={{ padding: '10px 22px' }}
            >
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Execute FAISS RAG Analysis</span>
                </>
              )}
            </button>
          </div>

          {selectedTicket && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: 'rgba(11, 15, 25, 0.4)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}>
              <strong>Selected Problem Description:</strong> {selectedTicket.description}
            </div>
          )}
        </div>

        {/* Output Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: recommendation ? '2fr 1fr' : '1fr', gap: '24px' }}>
          {/* Main Resolution Recommendation Card */}
          {recommendation && (
            <div className="card" style={{
              background: 'linear-gradient(180deg, rgba(24, 34, 52, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={18} color="#60a5fa" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px' }}>Grounded AI Resolution Recommendation</h3>
                    <div style={{ fontSize: '12px', color: '#93c5fd' }}>
                      Confidence: {((recommendation.confidence_score || 0.9) * 100).toFixed(0)}% • Engine: {recommendation.provider || 'RAG Synthesizer'}
                    </div>
                  </div>
                </div>

                {recommendation.status && (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    backgroundColor: recommendation.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: recommendation.status === 'Approved' ? '#34d399' : '#fbbf24',
                    border: recommendation.status === 'Approved' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                  }}>
                    {recommendation.status}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#93c5fd', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Probable Cause (Root-Cause Hypothesis)
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    backgroundColor: 'rgba(11, 15, 25, 0.5)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1.5,
                  }}>
                    {recommendation.probable_cause}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#93c5fd', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Recommended Troubleshooting Steps
                  </div>
                  <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                    {recommendation.recommended_steps?.map((step, idx) => (
                      <li key={idx} style={{ lineHeight: 1.5 }}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#93c5fd', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Supporting Knowledge Sources (Grounded in Vector DB)
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {recommendation.supporting_sources?.map((src, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        fontSize: '12px',
                        color: '#93c5fd',
                      }}>
                        <FileText size={14} />
                        <span><strong>{src.doc_id || 'DOC'}:</strong> {src.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {recommendation.escalation_recommendation && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: '#fbbf24',
                  }}>
                    <strong>Escalation Policy:</strong> {recommendation.escalation_recommendation}
                  </div>
                )}

                {/* Human-in-the-loop Approval Actions (Section 1 requirement) */}
                <div style={{
                  marginTop: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                    * Human approval required: No destructive action is executed without technician review.
                  </div>

                  {(isAgent || isAdmin) && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleReview('Rejected')}
                        disabled={reviewing || recommendation.status === 'Rejected'}
                        className="btn btn-secondary"
                        style={{ color: '#f87171' }}
                      >
                        <XCircle size={15} />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview('Approved')}
                        disabled={reviewing || recommendation.status === 'Approved'}
                        className="btn btn-primary"
                        style={{ backgroundColor: '#10b981' }}
                      >
                        <Check size={15} />
                        <span>Approve & Apply to Ticket</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Similar Incidents Sidebar (Section 3.E) */}
          {recommendation && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <History size={18} color="#3b82f6" />
                <h3 style={{ fontSize: '15px' }}>Similar Historical Incidents</h3>
              </div>

              {similarCases.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  No similar closed cases detected in historical archive.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {similarCases.map((sc) => (
                    <div
                      key={sc.id}
                      style={{
                        padding: '12px',
                        backgroundColor: 'rgba(11, 15, 25, 0.5)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa', fontWeight: '600' }}>
                          {sc.ticket_number}
                        </span>
                        <span style={{ color: '#34d399', fontWeight: '600' }}>
                          {(sc.similarity_score * 100).toFixed(0)}% Match
                        </span>
                      </div>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>
                        {sc.title}
                      </div>
                      {sc.resolution_notes && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
                          Resolved by: {sc.resolution_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
