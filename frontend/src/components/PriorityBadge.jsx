import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const norm = (priority || '').toLowerCase();
  let badgeClass = 'badge-priority-medium';

  if (norm === 'critical') badgeClass = 'badge-priority-critical';
  else if (norm === 'high') badgeClass = 'badge-priority-high';
  else if (norm === 'low') badgeClass = 'badge-priority-low';

  return <span className={`badge ${badgeClass}`}>{priority || 'Medium'}</span>;
};
