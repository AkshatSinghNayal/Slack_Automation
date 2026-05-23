const crypto = require('crypto');

module.exports = function verifyShopify(req, res, next) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');

  if (!secret || !hmacHeader || !req.rawBody) {
    return res.status(401).json({ error: 'Missing Shopify signature' });
  }

  const digest = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody, 'utf8')
    .digest('base64');

  const digestBuffer = Buffer.from(digest);
  const hmacBuffer = Buffer.from(hmacHeader);

  if (
    digestBuffer.length !== hmacBuffer.length ||
    !crypto.timingSafeEqual(digestBuffer, hmacBuffer)
  ) {
    return res.status(401).json({ error: 'Invalid Shopify signature' });
  }

  return next();
};
