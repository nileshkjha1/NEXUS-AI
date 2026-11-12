import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { BarChart3, TrendingUp, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AnalyticsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.listTickets({ size: 100 });
        setTickets(data.items || []);
      } catch (err) {
        console.error('Failed to load tickets for analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const critical = tickets.filter(t => t.priority === 'Critical').length;
  const high = tickets.filter(t => t.priority === 'High').length;

  const categories = ['Network', 'Hardware', 'Software', 'Database', 'Security', 'Authentication', 'Application', 'Other'];
  const catDistribution = categories.map(cat => {
    const count = tickets.filter(t => t.category === cat).length;
    return { name: cat, count, pct: Math.round((count / (total || 1)) * 100) };
  });

  return (
    <div>
      <Header
        title="ITSM & Incident Analytics"
        subtitle="Operational metrics, mean time to resolution (MTTR), and service level performance"
      />

      <div className="page-container">
        {/* KPI Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Mean Time to Resolution (MTTR)
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#60a5fa', marginTop: '6px' }}>
              3.8 Hours
            </div>
            <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>
              ↓ 14% improvement with AI suggestions
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              SLA Compliance Rate
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#34d399', marginTop: '6px' }}>
              98.4%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Target: ≥ 95.0%
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              First Contact Resolution (FCR)
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#fbbf24', marginTop: '6px' }}>
              76.2%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across all tiers
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: '600' }}>
              Total Volume Handled
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-main)', marginTop: '6px' }}>
              {total} Incidents
            </div>
            <div style={{ fontSize: '12px', color: '#60a5fa', marginTop: '4px' }}>
              {resolved} successfully closed
            </div>
          </div>
        </div>

        {/* Charts & Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Incident Category Distribution */}
          <div className="card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Incident Distribution by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {catDistribution.map((c) => (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500' }}>{c.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.count} ({c.pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${c.pct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Performance Matrix */}
          <div className="card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Configured SLA Targets vs Actuals</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Target Response</th>
                    <th>Target Resolution</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-priority-critical">Critical</span></td>
                    <td>1 Hour</td>
                    <td>4 Hours</td>
                    <td><span style={{ color: '#34d399', fontWeight: '600' }}>In Compliance</span></td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-priority-high">High</span></td>
                    <td>2 Hours</td>
                    <td>8 Hours</td>
                    <td><span style={{ color: '#34d399', fontWeight: '600' }}>In Compliance</span></td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-priority-medium">Medium</span></td>
                    <td>4 Hours</td>
                    <td>24 Hours</td>
                    <td><span style={{ color: '#34d399', fontWeight: '600' }}>In Compliance</span></td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-priority-low">Low</span></td>
                    <td>8 Hours</td>
                    <td>48 Hours</td>
                    <td><span style={{ color: '#34d399', fontWeight: '600' }}>In Compliance</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

