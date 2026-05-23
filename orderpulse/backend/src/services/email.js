const nodemailer = require('nodemailer');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const badgeColor = (classification) => {
  if (classification === 'VIP') {
    return '#d97706';
  }

  if (classification === 'risky') {
    return '#dc2626';
  }

  return '#2563eb';
};

const sendOrderEmail = async (order, aiResult) => {
  const { EMAIL_USER, EMAIL_PASS, EMAIL_TO } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const customerName = order?.customer
    ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
    : '';

  const classification = aiResult.classification;
  const safeSummary = escapeHtml(aiResult.summary || 'Order received.').replace(/\n/g, '<br />');
  const safeCustomer = escapeHtml(customerName || 'Guest');
  const safeEmail = escapeHtml(order.email || 'Unknown');
  const safeTotal = escapeHtml(order.total_price || '0.00');
  const safeOrderId = escapeHtml(order.id || '');
  const safeClassification = escapeHtml(classification);
  const fraudHints = aiResult.fraud_hints?.length
    ? `<ul>${aiResult.fraud_hints.map((hint) => `<li>${escapeHtml(hint)}</li>`).join('')}</ul>`
    : '<p>None</p>';

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2>OrderPulse Alert: Order #${safeOrderId}</h2>
      <p>
        <strong>Status:</strong>
        <span style="background:${badgeColor(classification)};color:#fff;padding:4px 10px;border-radius:12px;">
          ${safeClassification}
        </span>
      </p>
      <p><strong>Customer:</strong> ${safeCustomer}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Total:</strong> $${safeTotal}</p>
      <h3>AI Summary</h3>
      <p>${safeSummary}</p>
      <h3>Fraud Hints</h3>
      ${fraudHints}
    </div>
  `;

  await transporter.sendMail({
    from: EMAIL_USER,
    to: EMAIL_TO,
    subject: `[OrderPulse] ${safeClassification} order #${safeOrderId}`,
    html,
  });
};

module.exports = {
  sendOrderEmail,
};
