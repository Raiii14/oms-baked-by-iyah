import React, { useEffect, useState } from 'react';
import { X, CheckCircle, ChefHat, XCircle, Bell, Check, AlertCircle } from 'lucide-react';
import { UserNotification, OrderStatus } from '../types';

// Shared config used by both the toast and the notification panel in Layout
export const getNotifConfig = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PREPARING:
      return { borderColor: 'border-l-orange-500', iconColor: 'text-orange-500', Icon: ChefHat, label: 'Being Prepared 🧁' };
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

// ─── App-level cart/error/info toast ────────────────────────────────────────

export type AppNotification = { id: string; message: string; type: 'success' | 'error' | 'info' };

export const AppToast: React.FC<{ n: AppNotification }> = ({ n }) => {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 20);
    const hideTimer = setTimeout(() => { setVisible(false); setCollapsed(true); }, 2600);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  return (
    <div className={`overflow-hidden transition-all duration-300 ease-out ${
      collapsed ? 'max-h-0 mb-0' : 'max-h-20 mb-2'
    }`}>
      <div className={`
        pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg
        text-sm font-medium text-white transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'}
        ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-rose-500' : 'bg-stone-700'}
      `}>
        {n.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> :
         n.type === 'error'   ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> :
                                <Bell className="w-4 h-4 flex-shrink-0" />}
        <span>{n.message}</span>
      </div>
    </div>
  );
};

// ─── Order-status slide-in toasts ────────────────────────────────────────────

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
