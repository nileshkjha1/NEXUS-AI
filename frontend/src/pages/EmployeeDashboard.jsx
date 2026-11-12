import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { TicketTable } from '../components/TicketTable';
import { PlusCircle, Search, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const EmployeeDashboard = ({ onNavigateCreate, onSelectTicket }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await api.listTickets({
        my_tickets_only: true,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setTickets(data.items || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter]);

  // Compute metrics from current user's tickets
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status === 'Open' || t.status === 'Assigned' || t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div>
      <Header
        title={`Welcome, ${user?.full_name || 'Employee'}`}
        subtitle="Manage and track your technical support requests"
      />

      <div className="page-container">
        {/* KPI Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock size={22} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
                Active Incidents
              </div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-main)' }}>
                {activeTickets}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={22} color="#34d399" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
                Resolved
              </div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-main)' }}>
                {resolvedTickets}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertCircle size={22} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
                Total Submitted
              </div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-main)' }}>
                {totalTickets}
              </div>
            </div>
          </div>
        </div>

        {/* Section Header & Search / Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <input
                type="text"
                placeholder="Search my incidents..."
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
              className="form-control"
              style={{ width: '160px' }}
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

            <button onClick={fetchTickets} className="btn btn-secondary" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>

          <button
            onClick={onNavigateCreate}
            className="btn btn-primary"
            style={{ padding: '9px 18px' }}
          >
            <PlusCircle size={16} />
            <span>Report Incident</span>
          </button>
        </div>

        {/* Incidents Table */}
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

