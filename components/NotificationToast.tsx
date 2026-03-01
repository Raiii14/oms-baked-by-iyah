import React, { useEffect, useState } from 'react';
import { X, CheckCircle, ChefHat, XCircle, Bell } from 'lucide-react';
import { UserNotification, OrderStatus } from '../types';

// Shared config used by both the toast and the notification panel in Layout
export const getNotifConfig = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return { borderColor: 'border-l-blue-500', iconColor: 'text-blue-500', Icon: CheckCircle, label: 'Order Confirmed' };
    case OrderStatus.BAKING:
      return { borderColor: 'border-l-amber-500', iconColor: 'text-amber-500', Icon: ChefHat, label: 'Now Baking 🧁' };
    case OrderStatus.COMPLETED:
      return { borderColor: 'border-l-green-500', iconColor: 'text-green-500', Icon: CheckCircle, label: 'Order Ready! 🎂' };
    case OrderStatus.CANCELLED:
      return { borderColor: 'border-l-rose-500', iconColor: 'text-rose-500', Icon: XCircle, label: 'Order Cancelled' };
    default:
      return { borderColor: 'border-l-stone-400', iconColor: 'text-stone-500', Icon: Bell, label: 'Order Update' };
  }
};

// ─── Single Toast Card ───────────────────────────────────────────────────────

const SingleToast: React.FC<{
  toast: UserNotification;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const { borderColor, iconColor, Icon, label } = getNotifConfig(toast.orderStatus);

  useEffect(() => {
    // Delay the show slightly so the CSS transition fires
    const showTimer = setTimeout(() => setVisible(true), 30);
    // Auto-dismiss after 5.5 seconds
    const hideTimer = setTimeout(() => handleDismiss(), 5500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    // Wait for slide-out transition before removing from DOM
    setTimeout(() => onDismiss(toast.id), 350);
  };

  return (
    <div
      className={`
        w-80 bg-white rounded-xl shadow-lg border border-stone-200 border-l-4 ${borderColor}
        p-4 flex items-start gap-3
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
    >
      <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-stone-800">{label}</p>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 mt-0.5 text-stone-300 hover:text-stone-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Toast Container ─────────────────────────────────────────────────────────

interface NotificationToastProps {
  toasts: UserNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
