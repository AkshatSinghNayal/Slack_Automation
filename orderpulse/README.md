# OrderPulse

OrderPulse is a Shopify order automation system that classifies incoming orders with Groq AI, syncs customers to HubSpot, and pushes alerts to Slack, email, and a real-time React dashboard.

## Features

- Shopify webhook verification and order ingestion
- Groq AI order summary + VIP/risky/new classification
- HubSpot CRM contact upsert
- Slack Block Kit alerting
- Gmail (Nodemailer) email alerts for VIP/risky orders
- MongoDB Atlas order storage
- React dashboard with charts and order log

---

## Service Setup (Free Tiers)

### 1) Groq API
1. Create a free account at https://console.groq.com.
2. Generate an API key.
3. Add it to `GROQ_API_KEY` in `backend/.env`.

### 2) HubSpot CRM
1. Create a HubSpot developer account.
2. Create a Private App and copy the access token.
3. Create custom contact properties:
   - `customer_classification` (single-line text)
   - `last_order_tag` (single-line text)
4. Add the token to `HUBSPOT_API_KEY`.

### 3) Slack Incoming Webhook
1. Create a Slack App and enable Incoming Webhooks.
2. Add a webhook URL for your target channel.
3. Set `SLACK_WEBHOOK_URL`.

### 4) MongoDB Atlas
1. Create a free M0 cluster.
2. Create a database user and whitelist your IP.
3. Copy the connection string into `MONGODB_URI`.

### 5) Gmail App Password
1. Enable 2FA on your Gmail account.
2. Create an App Password for “Mail”.
3. Set `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_TO`.

### 6) Shopify Partner Store
1. Create a Shopify Partner account and development store.
2. Create a private app or custom app with webhook permissions.
3. Set the webhook URL to `/api/webhook/shopify`.
4. Copy the webhook secret into `SHOPIFY_WEBHOOK_SECRET`.

---

## Local Development

### Backend
```bash
cd orderpulse/backend
cp .env.example .env
npm install
npm start
```

### Frontend
```bash
cd orderpulse/frontend
npm install
npm run dev
```

Optional: set `VITE_API_BASE` in `frontend/.env` (or Vercel env) to point at the backend, e.g.:
```
VITE_API_BASE=https://your-backend-url.onrender.com/api/dashboard
```

---

## Test Webhook (No HMAC)

POST to `http://localhost:3001/api/webhook/test` with:
```json
{
  "id": 99001,
  "email": "akshat@test.com",
  "total_price": "249.00",
  "customer": { "first_name": "Akshat", "last_name": "Singh", "orders_count": 1 },
  "line_items": [
    { "title": "Premium Hoodie", "quantity": 2, "price": "124.50" }
  ],
  "billing_address": { "city": "Lucknow" },
  "shipping_address": { "city": "Mumbai" }
}
```

---

## Shopify Webhook Testing with ngrok

1. Install ngrok.
2. Run:
   ```bash
   ngrok http 3001
   ```
3. Use the public URL from ngrok as the Shopify webhook target:
   ```
   https://<your-ngrok-id>.ngrok-free.app/api/webhook/shopify
   ```
4. Trigger an order in your Shopify dev store.

---

## Deployment

### Backend → Render (Free Tier)
1. Create a new Web Service.
2. Connect this GitHub repository.
3. Set the root directory to `orderpulse/backend`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env.example`.

### Frontend → Vercel (Free Tier)
1. Create a new Vercel project from this repo.
2. Set the root directory to `orderpulse/frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_BASE` to `https://<render-backend>/api/dashboard`.

---

## API Endpoints

Backend base: `http://localhost:3001`

- `POST /api/webhook/shopify` — Shopify webhook (HMAC verified)
- `POST /api/webhook/test` — Test route (no HMAC)
- `GET /api/dashboard/orders` — Last 50 orders
- `GET /api/dashboard/stats` — Summary stats
- `GET /api/dashboard/chart` — 14-day classification chart data
