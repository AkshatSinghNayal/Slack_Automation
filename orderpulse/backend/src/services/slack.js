const fetch = (...args) =>
  import('node-fetch').then(({ default: fetchImpl }) => fetchImpl(...args));

const classificationLabel = (classification) => {
  if (classification === 'VIP') {
    return '👑 VIP';
  }

  if (classification === 'risky') {
    return '⚠️ Risky';
  }

  return '🆕 New';
};

const sendSlackAlert = async (order, aiResult) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  const customerName = order?.customer
    ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
    : '';

  const fields = [
    {
      type: 'mrkdwn',
      text: `*Customer*\n${customerName || 'Guest'}`,
    },
    {
      type: 'mrkdwn',
      text: `*Email*\n${order.email || 'Unknown'}`,
    },
    {
      type: 'mrkdwn',
      text: `*Total*\n$${order.total_price || '0.00'}`,
    },
    {
      type: 'mrkdwn',
      text: `*Classification*\n${classificationLabel(aiResult.classification)}`,
    },
  ];

  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🛒 New Order #${order.id}`,
        },
      },
      {
        type: 'section',
        fields,
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*AI Summary*\n${aiResult.summary}`,
        },
      },
    ],
  };

  if (aiResult.classification === 'risky') {
    const hints = aiResult.fraud_hints?.length
      ? aiResult.fraud_hints.map((hint) => `• ${hint}`).join('\n')
      : '• No fraud hints provided';
    payload.attachments = [
      {
        color: '#e01e5a',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Fraud hints*\n${hints}`,
            },
          },
        ],
      },
    ];
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

module.exports = {
  sendSlackAlert,
};
