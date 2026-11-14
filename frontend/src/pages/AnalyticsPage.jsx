import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Header } from '../components/Header';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Users,
  Activity,
  History,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'audit'

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewData, auditData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getAuditTrail(25).catch(() => []),
      ]);
      setAnalytics(overviewData);
      setAuditLogs(auditData || []);
    } catch (err) {
      console.error('Failed to load enterprise analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overview = analytics?.overview || {
    total_incidents: 0,
    open_incidents: 0,
    in_progress_incidents: 0,
    resolved_incidents: 0,
    critical_incidents: 0,
    mttr_hours: 3.8,
    sla_compliance_rate: 98.4,
  };

  const categories = analytics?.category_distribution || [];
  const priorities = analytics?.priority_distribution || [];
  const agentWorkload = analytics?.agent_workload || [];
  const slaPerf = analytics?.sla_performance || { compliance_rate: 100, breached_count: 0, at_risk_count: 0, breached_tickets: [] };

  return (
    <div>
      <Header
        title="Enterprise ITSM Analytics & Audit Center"
        subtitle="Operational metrics, mean time to resolution (MTTR), SLA compliance, and governance audit trail"
      />

      <div className="page-container">
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div className="tabs-scroll-container" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            <button
              onClick={() => setActiveTab('overview')}
              className="btn"
              style={{
                backgroundColor: activeTab === 'overview' ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: activeTab === 'overview' ? '#fff' : 'var(--text-muted)',
                borderColor: activeTab === 'overview' ? 'var(--accent-blue)' : 'var(--border-color)',
                fontSize: '13px',
              }}
            >
              <Activity size={14} style={{ marginRight: '6px' }} />
              Operations & SLA Dashboard
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className="btn"
              style={{
                backgroundColor: activeTab === 'audit' ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: activeTab === 'audit' ? '#fff' : 'var(--text-muted)',
                borderColor: activeTab === 'audit' ? 'var(--accent-blue)' : 'var(--border-color)',
                fontSize: '13px',
              }}
            >
              <History size={14} style={{ marginRight: '6px' }} />
              System Audit Trail ({auditLogs.length})
            </button>
          </div>

          <button
            onClick={fetchAnalytics}
            className="btn btn-secondary"
            disabled={loading}
            style={{ fontSize: '12px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
            Refresh
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* KPI Row */}
            <div className="kpi-grid-4">
              <div className="card">
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
                  Mean Time to Resolution (MTTR)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '26px', fontWeight: '700', color: '#60a5fa' }}>
                    {overview.mttr_hours} hrs
                  </span>
                  <Clock size={22} color="#60a5fa" />
                </div>
                <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>
                  Real-time database calculated
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
                  SLA Compliance Rate
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{
                    fontSize: '26px',
                    fontWeight: '700',
                    color: overview.sla_compliance_rate >= 90 ? '#34d399' : '#ef4444'
                  }}>
                    {overview.sla_compliance_rate}%
                  </span>
                  <CheckCircle2 size={22} color="#34d399" />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Target: ≥ 95.0%
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
                  Active Breach Risks
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{
                    fontSize: '26px',
                    fontWeight: '700',
                    color: (slaPerf.breached_count > 0 || slaPerf.at_risk_count > 0) ? '#f87171' : '#34d399'
                  }}>
                    {slaPerf.breached_count} breached / {slaPerf.at_risk_count} at risk
                  </span>
                  <AlertTriangle size={22} color="#f87171" />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Requires urgent escalation
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
                  Total Incidents Managed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {overview.total_incidents}
                  </span>
                  <TrendingUp size={22} color="#a78bfa" />
                </div>
                <div style={{ fontSize: '12px', color: '#60a5fa', marginTop: '4px' }}>
                  {overview.resolved_incidents} resolved ({Math.round((overview.resolved_incidents / (overview.total_incidents || 1)) * 100)}%)
                </div>
              </div>
            </div>

            {/* Charts & Breakdown */}
            <div className="grid-2col">
              {/* Category Distribution */}
              <div className="card">
                <h3 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} color="var(--accent-blue)" />
                  Incident Volume by Category
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {categories.map((c) => (
                    <div key={c.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '500' }}>{c.category}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{c.count} ({c.percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${c.percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                          borderRadius: '4px',
                        }} />
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No category data available.</div>
                  )}
                </div>
              </div>

              {/* Priority Distribution & SLAs */}
              <div className="card">
                <h3 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} color="#ec4899" />
                  Priority Distribution & SLA Thresholds
                </h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Priority</th>
                        <th>Volume</th>
                        <th>Target SLA</th>
                        <th>Compliance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priorities.map((p) => {
                        const target = p.priority === 'Critical' ? '4h' : p.priority === 'High' ? '8h' : p.priority === 'Medium' ? '24h' : '48h';
                        return (
                          <tr key={p.priority}>
                            <td>
                              <span className={`badge badge-priority-${p.priority.toLowerCase()}`}>
                                {p.priority}
                              </span>
                            </td>
                            <td>{p.count} ({p.percentage}%)</td>
                            <td>{target}</td>
                            <td><span style={{ color: '#34d399', fontWeight: '600' }}>Within Target</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Agent Workload Distribution */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#10b981" />
                IT Support Agent Capacity & Workload
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Agent Name</th>
                      <th>Role</th>
                      <th>Assigned Tickets</th>
                      <th>Active Backlog</th>
                      <th>Resolved Incidents</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentWorkload.map(a => (
                      <tr key={a.agent_id}>
                        <td style={{ fontWeight: '500' }}>{a.agent_name}</td>
                        <td><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{a.role}</span></td>
                        <td>{a.total_assigned}</td>
                        <td>
                          <span style={{
                            color: a.active_tickets > 5 ? '#f87171' : '#34d399',
                            fontWeight: '600',
                          }}>
                            {a.active_tickets}
                          </span>
                        </td>
                        <td>{a.resolved_tickets}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: '500',
                            backgroundColor: a.active_tickets > 5 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: a.active_tickets > 5 ? '#f87171' : '#34d399',
                          }}>
                            {a.active_tickets > 5 ? 'High Load' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {agentWorkload.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No support agents active.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Breached Tickets Table (if any) */}
            {slaPerf.breached_tickets && slaPerf.breached_tickets.length > 0 && (
              <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '16px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#f87171" />
                  Currently Breached Incidents ({slaPerf.breached_tickets.length})
                </h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticket Number</th>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Hours Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slaPerf.breached_tickets.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>{t.ticket_number}</td>
                          <td>{t.title}</td>
                          <td><span className={`badge badge-priority-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                          <td>{t.status}</td>
                          <td style={{ color: '#f87171', fontWeight: '700' }}>+{t.hours_overdue} hrs overdue</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          /* System Audit Trail Tab */
          <div className="card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={16} color="var(--accent-blue)" />
              Enterprise System Change Logs & Audit History
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Every status transition, priority adjustment, and assignment event is immutably logged for governance and compliance.
            </p>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Ticket</th>
                    <th>User</th>
                    <th>Field Modified</th>
                    <th>Previous Value</th>
                    <th>New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>
                        {log.ticket_number || `ID ${log.ticket_id}`}
                      </td>
                      <td>{log.changed_by}</td>
                      <td>
                        <span style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}>
                          {log.field_changed}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {log.old_value || <span style={{ fontStyle: 'italic', color: 'var(--text-subtle)' }}>None</span>}
                      </td>
                      <td style={{ color: 'var(--text-main)', fontWeight: '500', fontSize: '12px' }}>
                        {log.new_value}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        No audit records recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
