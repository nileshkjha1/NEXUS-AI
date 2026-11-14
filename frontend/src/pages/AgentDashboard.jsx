import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { TicketTable } from '../components/TicketTable';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, Inbox, RefreshCw } from 'lucide-react';

export const AgentDashboard = ({ onSelectTicket, onNavigateCreate }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned_to_me', 'unassigned'
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      };

      if (activeTab === 'assigned_to_me') {
        params.assigned_to_id = user?.id;
      }

      const data = await api.listTickets(params);
      let list = data.items || [];
      if (activeTab === 'unassigned') {
        list = list.filter(t => !t.assigned_to_id);
      }
      setTickets(list);
    } catch (err) {
      console.error('Failed to fetch agent tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab, search, priorityFilter, categoryFilter, statusFilter]);

  // Compute live metrics
  const unassignedCount = tickets.filter(t => !t.assigned_to_id).length;
  const criticalCount = tickets.filter(t => t.priority === 'Critical' || t.priority === 'High').length;
  const myAssignedCount = tickets.filter(t => t.assigned_to_id === user?.id).length;

  return (
    <div>
      <Header
        title="IT Support Agent Workbench"
        subtitle="Triage, investigate, and resolve organizational technical incidents"
      />

      <div className="page-container">
        {/* KPI Metrics */}
        <div className="kpi-grid-4">
          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              High & Critical Incidents
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: '#f87171' }}>{criticalCount}</span>
              <AlertTriangle size={22} color="#f87171" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Assigned to Me
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: '#60a5fa' }}>{myAssignedCount}</span>
              <Clock size={22} color="#60a5fa" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Unassigned Queue
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: '#fbbf24' }}>{unassignedCount}</span>
              <Inbox size={22} color="#fbbf24" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Current Queue Total
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-main)' }}>{tickets.length}</span>
              <CheckCircle size={22} color="#34d399" />
            </div>
          </div>
        </div>

        {/* Tab Switcher & Filter Bar */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
          {/* Quick Tabs */}
          <div className="tabs-scroll-container">
            <button
              onClick={() => setActiveTab('all')}
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              All Incidents
            </button>
            <button
              onClick={() => setActiveTab('assigned_to_me')}
              className={`btn ${activeTab === 'assigned_to_me' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              My Assigned Tickets
            </button>
            <button
              onClick={() => setActiveTab('unassigned')}
              className={`btn ${activeTab === 'unassigned' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              Unassigned Pool
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="filter-bar-responsive">
            <div className="filter-search-box">
              <input
                type="text"
                placeholder="Search ticket title, summary, or INC-#..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Network">Network</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Database">Database</option>
              <option value="Security">Security</option>
              <option value="Authentication">Authentication</option>
              <option value="Application">Application</option>
              <option value="Other">Other</option>
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

            <select
              className="form-control filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <button
              onClick={fetchTickets}
              className="btn btn-secondary"
              title="Refresh"
              aria-label="Refresh tickets list"
              style={{ minWidth: '40px' }}
            >
              <RefreshCw size={14} />
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

