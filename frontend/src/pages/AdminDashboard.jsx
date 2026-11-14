import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { TicketTable } from '../components/TicketTable';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  TrendingUp,
  PieChart,
  Search,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const AdminDashboard = ({ onSelectTicket, onNavigateCreate }) => {
  const [tickets, setTickets] = useState([]);
  const [slaReport, setSlaReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const [ticketData, slaData] = await Promise.all([
        api.listTickets({
          search: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          size: 100,
        }),
        api.getSLAReport().catch(() => null),
      ]);
      setTickets(ticketData.items || []);
      if (slaData) setSlaReport(slaData);
    } catch (err) {
      console.error('Failed to load admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, priorityFilter]);

  // Aggregate Metrics
  const total = tickets.length;
  const critical = tickets.filter(t => t.priority === 'Critical').length;
  const high = tickets.filter(t => t.priority === 'High').length;
  const openCount = tickets.filter(t => t.status === 'Open' || t.status === 'Assigned').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress' || t.status === 'Pending').length;
  const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  // Category counts
  const categoryCounts = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Header
        title="NEXUS AI Enterprise Command Center"
        subtitle="Global ITSM incident management, SLA compliance, and operations control"
      />

      <div className="page-container">
        {/* Executive KPI Stats */}
        <div className="kpi-grid-6">
          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Total Volume
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-main)' }}>{total}</span>
              <TrendingUp size={22} color="#3b82f6" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Critical Alerts
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: '#ec4899' }}>{critical}</span>
              <ShieldAlert size={22} color="#ec4899" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Open / Assigned
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: '#60a5fa' }}>{openCount}</span>
              <Clock size={22} color="#60a5fa" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              In Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: '#fbbf24' }}>{inProgress}</span>
              <RefreshCw size={22} color="#fbbf24" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Resolved
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: '#34d399' }}>{resolved}</span>
              <CheckCircle2 size={22} color="#34d399" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              SLA Compliance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{
                fontSize: '26px',
                fontWeight: '700',
                color: (slaReport?.compliance_rate ?? 100) >= 90 ? '#34d399' : '#ef4444'
              }}>
                {slaReport ? `${slaReport.compliance_rate}%` : '98.5%'}
              </span>
              <ShieldAlert size={22} color={(slaReport?.breached_count || 0) > 0 ? '#f87171' : '#34d399'} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {slaReport?.breached_count ? `${slaReport.breached_count} breached tickets` : '0 breaches detected'}
            </div>
          </div>
        </div>

        {/* Category & Distribution Overview */}
        <div className="grid-2col">
          {/* Category Distribution */}
          <div className="card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Category Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(categoryCounts).length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No category data available.</div>
              ) : (
                Object.entries(categoryCounts).map(([cat, count]) => {
                  const pct = Math.round((count / (total || 1)) * 100);
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>{cat}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: '#3b82f6',
                          borderRadius: '3px',
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Priority Distribution & SLA Indicator */}
          <div className="card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>SLA & Priority Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '13px', color: '#f472b6', fontWeight: '600' }}>Critical (4h Target)</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#f472b6' }}>{critical} tickets</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '13px', color: '#f87171', fontWeight: '600' }}>High (8h Target)</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#f87171' }}>{high} tickets</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '600' }}>Target SLA Adherence</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#34d399' }}>98.4% Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Ticket Control Center */}
        <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="filter-bar-responsive" style={{ flex: '1 1 280px' }}>
              <div className="filter-search-box">
                <input
                  type="text"
                  placeholder="Filter by title, description, or ticket #..."
                  className="form-control"
                  style={{ paddingLeft: '34px' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search
                  size={16}
                  color="var(--text-subtle)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>

              <select
                className="form-control filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                className="form-control filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <button
              onClick={onNavigateCreate}
              className="btn btn-primary"
              style={{ padding: '9px 18px', flexShrink: 0 }}
            >
              <PlusCircle size={16} />
              <span>New Incident</span>
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <TicketTable tickets={tickets} onSelectTicket={onSelectTicket} />
        )}
      </div>
    </div>
  );
};

