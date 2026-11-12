import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  Bot,
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';

export const AIResolutionDesk = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);

  useEffect(() => {
    const loadOpenTickets = async () => {
      try {
        const data = await api.listTickets({ status: 'Open' });
        setTickets(data.items || []);
        if (data.items?.length > 0) {
          setSelectedTicketId(data.items[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
      }
    };
    loadOpenTickets();
  }, []);

  const handleGenerateRecommendation = () => {
    const ticket = tickets.find(t => t.id.toString() === selectedTicketId);
    if (!ticket) return;

    setLoading(true);
    setApprovalStatus(null);

    // AI resolution synthesis simulation based on ticket data (precursor to Phase 5 RAG pipeline)
    setTimeout(() => {
      setRecommendation({
        ticketNumber: ticket.ticket_number,
        summary: ticket.title,
        probableCause: `Network routing or firewall rule restriction identified for service: ${ticket.category}. Local client configuration or gateway ACL mismatch.`,
        confidenceScore: 0.94,
        steps: [
          'Verify client IP lease and corporate VPN gateway tunnel route tables.',
          'Confirm that host DNS can resolve the internal PostgreSQL connection pooler hostname.',
          'Execute connectivity probe: test TCP port reachability on destination port.',
          'If unreachable, request Network Operations to update security group ingress rules.',
        ],
        knowledgeSources: [
          { title: 'KB-204: Troubleshooting Database Connection Over Corporate VPN', id: 'DOC-1029' },
          { title: 'SOP-Network-01: Enterprise Tunnel Routing & Gateway ACLs', id: 'DOC-0481' },
        ],
        escalationAdvice: 'If connection probe fails after step 3, escalate to Tier-3 Database Infrastructure Team.',
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div>
      <Header
        title="AI Incident Resolution Desk"
        subtitle="Retrieval-Augmented Generation (RAG) assistant for automated root cause analysis"
      />

      <div className="page-container">
        {/* Ticket Selector Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Bot size={20} color="#3b82f6" />
            <h3 style={{ fontSize: '16px' }}>Select Target Incident for AI Investigation</h3>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <label className="form-label">Active Open Ticket</label>
              <select
                className="form-control"
                value={selectedTicketId}
                onChange={(e) => {
                  setSelectedTicketId(e.target.value);
                  setRecommendation(null);
                }}
              >
                {tickets.length === 0 ? (
                  <option value="">No open tickets available</option>
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
              style={{ padding: '10px 20px' }}
            >
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze & Generate Resolution</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Output Card */}
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
                  <h3 style={{ fontSize: '16px' }}>Resolution Recommendation for {recommendation.ticketNumber}</h3>
                  <div style={{ fontSize: '12px', color: '#93c5fd' }}>
                    Confidence Score: {(recommendation.confidenceScore * 100).toFixed(0)}% • Grounded in FAISS Vector Knowledge Base
                  </div>
                </div>
              </div>

              {approvalStatus && (
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: approvalStatus === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: approvalStatus === 'Approved' ? '#34d399' : '#f87171',
                }}>
                  Recommendation {approvalStatus}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#93c5fd', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Probable Root Cause
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', backgroundColor: 'rgba(11, 15, 25, 0.5)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                  {recommendation.probableCause}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#93c5fd', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Recommended Action Steps (Technician Guide)
                </div>
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                  {recommendation.steps.map((s, idx) => (
                    <li key={idx} style={{ lineHeight: 1.5 }}>{s}</li>
                  ))}
                </ol>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#93c5fd', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Supporting Knowledge Sources (Grounded Retrieval)
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {recommendation.knowledgeSources.map((ks, i) => (
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
                      <span>{ks.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: '#fbbf24',
              }}>
                <strong>Escalation Policy:</strong> {recommendation.escalationAdvice}
              </div>

              {/* Human-in-the-loop Approval Actions */}
              <div style={{
                marginTop: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                  * Requires human agent authorization before incident closure or resolution application.
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setApprovalStatus('Rejected')}
                    className="btn btn-secondary"
                    style={{ color: '#f87171' }}
                  >
                    <XCircle size={15} />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalStatus('Approved')}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <CheckCircle size={15} />
                    <span>Approve Recommendation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
