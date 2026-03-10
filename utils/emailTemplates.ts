import { Order, OrderStatus } from '../types';

// ─── Shared Layout ────────────────────────────────────────────────────────────

const wrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ee;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#e11d48;padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:1px;">Baked by Iyah</p>
            <p style="margin:6px 0 0;font-size:13px;color:#fecdd3;">Homemade with love 🎂</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#fdf2f4;padding:20px 32px;text-align:center;border-top:1px solid #fecdd3;">
            <p style="margin:0;font-size:12px;color:#9f1239;">Questions? Reply to this email or message us on Facebook.</p>
            <p style="margin:6px 0 0;font-size:11px;color:#d1b8bc;">© 2026 Baked by Iyah. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const heading = (text: string) =>
  `<h1 style="margin:0 0 8px;font-size:22px;color:#1c1917;">${text}</h1>`;

const subheading = (text: string) =>
  `<p style="margin:0 0 24px;font-size:14px;color:#78716c;">${text}</p>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid #f0e9e7;margin:20px 0;">`;

const labelValue = (label: string, value: string) =>
  `<tr>
    <td style="padding:6px 0;font-size:13px;color:#78716c;white-space:nowrap;padding-right:16px;">${label}</td>
    <td style="padding:6px 0;font-size:13px;color:#1c1917;font-weight:600;">${value}</td>
  </tr>`;

const infoTable = (rows: string) =>
  `<table cellpadding="0" cellspacing="0" style="width:100%;">${rows}</table>`;

const itemsTable = (order: Order) => {
  const rows = order.items.map(
    (item) =>
      `<tr>
        <td style="padding:8px 0;font-size:13px;color:#1c1917;border-bottom:1px solid #f5f0ee;">${item.name}</td>
        <td style="padding:8px 0;font-size:13px;color:#78716c;border-bottom:1px solid #f5f0ee;text-align:center;">×${item.quantity}</td>
        <td style="padding:8px 0;font-size:13px;color:#1c1917;border-bottom:1px solid #f5f0ee;text-align:right;">₱${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`,
  ).join('');

  return `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
      <thead>
        <tr style="background:#fdf2f4;">
          <th style="padding:8px;font-size:12px;color:#9f1239;text-align:left;font-weight:600;">Item</th>
          <th style="padding:8px;font-size:12px;color:#9f1239;text-align:center;font-weight:600;">Qty</th>
          <th style="padding:8px;font-size:12px;color:#9f1239;text-align:right;font-weight:600;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:10px 0 0;font-size:14px;font-weight:bold;color:#1c1917;">Total</td>
          <td style="padding:10px 0 0;font-size:14px;font-weight:bold;color:#e11d48;text-align:right;">₱${order.totalAmount.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>`;
};

const customDetailsTable = (order: Order) => {
  if (!order.customDetails) return '';
  const d = order.customDetails;
  const fields: [string, string][] = [
    ['Size', d.size],
    ['Servings', d.servings],
    ['Flavor', d.flavor],
    ['Color', d.color],
    ['Toppers', d.toppers.length ? d.toppers.join(', ') : 'None'],
    ['Cake Message', d.cakeMessage || 'None'],
    ['Notes', d.notes || 'None'],
    ['Preferred Date', order.scheduledDate],
  ];
  return infoTable(fields.map(([l, v]) => labelValue(l, v)).join(''));
};

// ─── Exported Templates ───────────────────────────────────────────────────────

export function orderPlacedCustomerHtml(order: Order): string {
  return wrapper(`
    ${heading('Order Placed! 🎉')}
    ${subheading(`Thanks ${order.customerName}! We've received your order and will start processing it soon.`)}
    ${infoTable([
      labelValue('Order ID', order.id),
      labelValue('Payment', order.paymentMethod),
      labelValue('Delivery', order.deliveryMethod),
      labelValue('Scheduled Date', order.scheduledDate),
      ...(order.deliveryAddress ? [labelValue('Address', order.deliveryAddress)] : []),
    ].join(''))}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1c1917;">Order Summary</p>
    ${itemsTable(order)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#78716c;">You can track your order status in your profile. To request a cancellation, please message us on Facebook before your order is being prepared.</p>
  `);
}

export function orderPlacedAdminHtml(order: Order): string {
  return wrapper(`
    ${heading('New Order Received 🛒')}
    ${subheading('A customer just placed an order.')}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1c1917;">Customer Details</p>
    ${infoTable([
      labelValue('Name', order.customerName),
      labelValue('Email', order.customerEmail || '—'),
      labelValue('Phone', order.customerPhone || '—'),
    ].join(''))}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1c1917;">Order Details</p>
    ${infoTable([
      labelValue('Order ID', order.id),
      labelValue('Payment', order.paymentMethod),
      labelValue('Delivery', order.deliveryMethod),
      labelValue('Scheduled Date', order.scheduledDate),
      ...(order.deliveryAddress ? [labelValue('Address', order.deliveryAddress)] : []),
    ].join(''))}
    ${divider()}
    ${itemsTable(order)}
  `);
}

export function inquirySubmittedCustomerHtml(order: Order): string {
  return wrapper(`
    ${heading('Inquiry Received! 🎂')}
    ${subheading(`Hi ${order.customerName}! We've received your custom cake inquiry (${order.id}). We'll review the details and reach out to you soon.`)}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1c1917;">Inquiry Details</p>
    ${customDetailsTable(order)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#78716c;">We'll contact you to discuss pricing and finalize your order. Thank you for choosing Baked by Iyah!</p>
  `);
}

export function inquirySubmittedAdminHtml(order: Order): string {
  return wrapper(`
    ${heading('New Custom Cake Inquiry 🎨')}
    ${subheading('A customer has submitted a custom cake request.')}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1c1917;">Customer Details</p>
    ${infoTable([
      labelValue('Name', order.customerName),
      labelValue('Email', order.customerEmail || '—'),
      labelValue('Phone', order.customerPhone || '—'),
    ].join(''))}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1c1917;">Inquiry Details</p>
    ${customDetailsTable(order)}
  `);
}

export function quoteReadyCustomerHtml(order: Order): string {
  return wrapper(`
    ${heading('Your Custom Cake Quote is Ready! 🎂')}
    ${subheading(`Hi ${order.customerName}! We've reviewed your custom cake inquiry and prepared a price quote for you.`)}
    ${infoTable([
      labelValue('Inquiry ID', order.id),
      labelValue('Price Quote', `₱${order.totalAmount.toLocaleString()}`),
      labelValue('Size', order.customDetails?.size || '—'),
      labelValue('Flavor', order.customDetails?.flavor || '—'),
      labelValue('Servings', order.customDetails?.servings || '—'),
    ].join(''))}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#78716c;">Log in to your account and visit your Custom Cakes tab to accept or decline this quote. We look forward to creating your dream cake!</p>
  `);
}

export function inquiryAcceptedAdminHtml(order: Order): string {
  return wrapper(`
    ${heading('Inquiry Accepted ✅')}
    ${subheading('A customer has accepted their custom cake quote.')}
    ${infoTable([
      labelValue('Inquiry ID', order.id),
      labelValue('Customer', order.customerName),
      labelValue('Email', order.customerEmail || '—'),
      labelValue('Phone', order.customerPhone || '—'),
      labelValue('Price', `₱${order.totalAmount.toLocaleString()}`),
      labelValue('Payment', order.paymentMethod),
      labelValue('Delivery', order.deliveryMethod),
      ...(order.deliveryAddress ? [labelValue('Address', order.deliveryAddress)] : []),
      labelValue('Scheduled Date', order.scheduledDate),
    ].join(''))}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1c1917;">Inquiry Details</p>
    ${customDetailsTable(order)}
  `);
}

export function orderStatusChangedHtml(order: Order, newStatus: OrderStatus): string {
  const statusMessages: Partial<Record<OrderStatus, { emoji: string; body: string }>> = {
    [OrderStatus.PREPARING]: {
      emoji: '🧁',
      body: `Your order <strong>${order.id}</strong> is confirmed and is now being prepared for delivery.`,
    },
    [OrderStatus.COMPLETED]: {
      emoji: '🎂',
      body: `Your order <strong>${order.id}</strong> is ready! Please come pick it up or expect your delivery soon. Thank you for choosing Baked by Iyah!`,
    },
    [OrderStatus.CANCELLED]: {
      emoji: '❌',
      body: `We regret to inform you that your order <strong>${order.id}</strong> has been cancelled. Please message us on Facebook if you have any concerns.`,
    },
  };

  const info = statusMessages[newStatus] ?? {
    emoji: '📦',
    body: `Your order <strong>${order.id}</strong> status has been updated to <strong>${newStatus}</strong>.`,
  };

  return wrapper(`
    ${heading(`Order Update ${info.emoji}`)}
    <p style="margin:0 0 24px;font-size:14px;color:#1c1917;">${info.body}</p>
    ${infoTable([
      labelValue('Order ID', order.id),
      labelValue('New Status', newStatus),
      labelValue('Scheduled Date', order.scheduledDate),
    ].join(''))}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#78716c;">Questions? Don't hesitate to reach out to us.</p>
  `);
}

export function orderCancelledAdminHtml(order: Order): string {
  return wrapper(`
    ${heading('Order Cancelled ❌')}
    ${subheading('A customer has cancelled their order.')}
    ${infoTable([
      labelValue('Order ID', order.id),
      labelValue('Customer', order.customerName),
      labelValue('Email', order.customerEmail || '—'),
      labelValue('Phone', order.customerPhone || '—'),
      labelValue('Total', `₱${order.totalAmount.toFixed(2)}`),
      labelValue('Payment', order.paymentMethod),
      labelValue('Scheduled Date', order.scheduledDate),
    ].join(''))}
    ${divider()}
    ${itemsTable(order)}
  `);
}

export function inquiryDeclinedAdminHtml(order: Order): string {
  return wrapper(`
    ${heading('Inquiry Declined ❌')}
    ${subheading('A customer has declined their custom cake inquiry.')}
    ${infoTable([
      labelValue('Inquiry ID', order.id),
      labelValue('Customer', order.customerName),
      labelValue('Email', order.customerEmail || '—'),
      labelValue('Phone', order.customerPhone || '—'),
    ].join(''))}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1c1917;">Inquiry Details</p>
    ${customDetailsTable(order)}
  `);
}

export function getStatusSubject(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PREPARING:  return "Your order is now being prepared!";
    case OrderStatus.COMPLETED:  return "Your order is ready!";
    case OrderStatus.CANCELLED:  return "Your order has been cancelled";
    default:                     return `Order status updated: ${status}`;
  }
}
