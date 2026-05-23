const express = require('express');
const verifyShopify = require('../middleware/verifyShopify');
const { analyzeOrder } = require('../services/ai');
const { upsertContact } = require('../services/hubspot');
const { sendSlackAlert } = require('../services/slack');
const { sendOrderEmail } = require('../services/email');
const Order = require('../models/Order');
const { normalizeClassification } = require('../utils/classify');

const router = express.Router();

const processOrder = async (order) => {
  const aiResult = await analyzeOrder(order);
  const classification = normalizeClassification(aiResult.classification);
  const normalizedAi = { ...aiResult, classification };

  const customer = order.customer || {};
  const customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();

  const hubspotContactId = await upsertContact({
    email: order.email,
    firstName: customer.first_name,
    lastName: customer.last_name,
    classification,
    orderId: order.id,
  });

  await sendSlackAlert(order, normalizedAi);

  if (['VIP', 'risky'].includes(classification)) {
    await sendOrderEmail(order, normalizedAi);
  }

  const createdAt = order.created_at ? new Date(order.created_at) : new Date();

  const savedOrder = await Order.create({
    shopifyOrderId: String(order.id),
    customerEmail: order.email || '',
    customerName,
    totalPrice: Number(order.total_price || 0),
    lineItems: order.line_items || [],
    classification,
    aiSummary: normalizedAi.summary,
    fraudHints: normalizedAi.fraud_hints || [],
    hubspotContactId: hubspotContactId || '',
    createdAt,
  });

  return savedOrder;
};

router.post('/shopify', verifyShopify, async (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    const saved = await processOrder(order);
    return res.status(200).json({ status: 'ok', orderId: saved.shopifyOrderId });
  } catch (error) {
    console.error('Webhook processing error', error);
    return res.status(500).json({ error: 'Failed to process order' });
  }
});

router.post('/test', async (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    const saved = await processOrder(order);
    return res.status(200).json({ status: 'ok', orderId: saved.shopifyOrderId });
  } catch (error) {
    console.error('Test webhook error', error);
    return res.status(500).json({ error: 'Failed to process test order' });
  }
});

module.exports = router;
