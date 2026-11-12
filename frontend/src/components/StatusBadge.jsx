import React from 'react';

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase().replace(' ', '-');
  let badgeClass = 'badge-status-open';

  if (norm === 'assigned') badgeClass = 'badge-status-assigned';
  else if (norm === 'in-progress') badgeClass = 'badge-status-in-progress';
  else if (norm === 'pending') badgeClass = 'badge-status-pending';
  else if (norm === 'resolved') badgeClass = 'badge-status-resolved';
  else if (norm === 'closed') badgeClass = 'badge-status-closed';

  return <span className={`badge ${badgeClass}`}>{status || 'Open'}</span>;
};

