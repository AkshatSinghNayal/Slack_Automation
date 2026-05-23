const nodemailer = require('nodemailer');

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
  const fraudHints = aiResult.fraud_hints?.length
    ? `<ul>${aiResult.fraud_hints.map((hint) => `<li>${hint}</li>`).join('')}</ul>`
    : '<p>None</p>';

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2>OrderPulse Alert: Order #${order.id}</h2>
      <p>
        <strong>Status:</strong>
        <span style="background:${badgeColor(classification)};color:#fff;padding:4px 10px;border-radius:12px;">
          ${classification}
        </span>
      </p>
      <p><strong>Customer:</strong> ${customerName || 'Guest'}</p>
      <p><strong>Email:</strong> ${order.email || 'Unknown'}</p>
      <p><strong>Total:</strong> $${order.total_price || '0.00'}</p>
      <h3>AI Summary</h3>
      <p>${aiResult.summary}</p>
      <h3>Fraud Hints</h3>
      ${fraudHints}
    </div>
  `;

  await transporter.sendMail({
    from: EMAIL_USER,
    to: EMAIL_TO,
    subject: `[OrderPulse] ${classification} order #${order.id}`,
    html,
  });
};

module.exports = {
  sendOrderEmail,
};
