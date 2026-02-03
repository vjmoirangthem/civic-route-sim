import React from 'react';
import { CollectionStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CollectionStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig: Record<CollectionStatus, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'status-pending' },
    approaching: { label: 'Approaching', class: 'status-approaching' },
    collected: { label: 'Collected', class: 'status-collected' },
    missed: { label: 'Missed', class: 'status-missed' },
  };

  const config = statusConfig[status];

  return (
    <span className={cn('status-badge', config.class, className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
