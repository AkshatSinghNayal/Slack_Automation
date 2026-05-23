const express = require('express');
const Order = require('../models/Order');

const router = express.Router();

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json(orders);
  } catch (error) {
    console.error('Dashboard orders error', error);
    return res.status(500).json({ error: 'Failed to load orders' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [total, vip, risky, newCount, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ classification: 'VIP' }),
      Order.countDocuments({ classification: 'risky' }),
      Order.countDocuments({ classification: 'new' }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueAgg?.[0]?.totalRevenue || 0;
    const avgOrderValue = total ? totalRevenue / total : 0;

    return res.json({
      total,
      vip,
      risky,
      new: newCount,
      totalRevenue,
      avgOrderValue,
    });
  } catch (error) {
    console.error('Dashboard stats error', error);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/chart', async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 13);
    startDate.setHours(0, 0, 0, 0);

    const raw = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            classification: '$classification',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          counts: {
            $push: {
              classification: '$_id.classification',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dateMap = new Map();
    raw.forEach((entry) => {
      const record = { date: entry._id, VIP: 0, risky: 0, new: 0 };
      entry.counts.forEach((countItem) => {
        record[countItem.classification] = countItem.count;
      });
      dateMap.set(entry._id, record);
    });

    const response = [];
    for (let i = 0; i < 14; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      response.push(dateMap.get(key) || { date: key, VIP: 0, risky: 0, new: 0 });
    }

    return res.json(response);
  } catch (error) {
    console.error('Dashboard chart error', error);
    return res.status(500).json({ error: 'Failed to load chart data' });
  }
});

module.exports = router;
