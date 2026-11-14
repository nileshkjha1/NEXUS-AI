import React from 'react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { ChevronRight, Inbox, Clock } from 'lucide-react';

export const TicketTable = ({ tickets, onSelectTicket }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Inbox size={24} color="#3b82f6" />
        </div>
        <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>No Incidents Found</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px' }}>
          There are no tickets matching your current filter criteria or assigned to this queue.
        </p>
      </div>
    );
  }

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ticket #</th>
            <th>Title & Summary</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              onClick={() => onSelectTicket && onSelectTicket(t.id)}
              style={{ cursor: 'pointer' }}
            >
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: '#60a5fa', whiteSpace: 'nowrap' }}>
                {t.ticket_number}
              </td>
              <td className="cell-wrap">
                <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px', wordBreak: 'break-word' }}>
                  {t.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '280px',
                }}>
                  {t.description}
                </div>
              </td>
              <td>
                <span style={{
                  fontSize: '12px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                }}>
                  {t.category}
                </span>
              </td>
              <td>
                <PriorityBadge priority={t.priority} />
              </td>
              <td>
                <StatusBadge status={t.status} />
              </td>
              <td>
                <div style={{ fontSize: '12px', color: t.assignee ? 'var(--text-main)' : 'var(--text-subtle)' }}>
                  {t.assignee ? t.assignee.full_name : 'Unassigned'}
                </div>
              </td>
              <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {formatDate(t.created_at)}
              </td>
              <td style={{ textAlign: 'right' }}>
                <ChevronRight size={16} color="var(--text-subtle)" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

