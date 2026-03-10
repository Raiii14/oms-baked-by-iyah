import React from 'react';
import { OrderStatus } from '../types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:   'bg-amber-100 text-amber-700',
  [OrderStatus.PREPARING]: 'bg-orange-100 text-orange-700',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-600',
};

interface Props {
  status: OrderStatus;
  className?: string;
}

const StatusBadge: React.FC<Props> = ({ status, className = '' }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[status]} ${className}`}>
    {status}
  </span>
);

export default StatusBadge;
