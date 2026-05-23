const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  shopifyOrderId: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  customerName: { type: String, default: '' },
  totalPrice: { type: Number, default: 0 },
  lineItems: { type: Array, default: [] },
  classification: { type: String, enum: ['VIP', 'new', 'risky'], default: 'new' },
  aiSummary: { type: String, default: '' },
  fraudHints: { type: [String], default: [] },
  hubspotContactId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
