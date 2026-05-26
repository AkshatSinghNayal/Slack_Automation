# Slack Automation

OrderPulse is a full-stack webhook automation and analytics dashboard for e-commerce orders. It ingests Shopify webhooks, uses Gemini for order classification, syncs contacts to HubSpot, and dispatches alerts to Slack and email. A React dashboard provides order analytics and fraud signals.

## Repository structure

- orderpulse/backend: Express API, webhook processing, integrations
- orderpulse/frontend: React dashboard (Vite)

## Key features

- Shopify webhook verification and test endpoint
- Gemini-based order classification and summaries
- HubSpot contact upsert
- Slack Block Kit alerts and email notifications
- MongoDB persistence and analytics API
- React dashboard with charts, tables, and stats

## Tech stack

- Backend: Node.js, Express, Mongoose, Nodemailer
- Frontend: React, Vite
- Integrations: Shopify Webhooks, HubSpot, Slack, Gemini

## Environment variables

Backend uses a .env file in orderpulse/backend:

```ini
PORT=3001
MONGODB_URI=mongodb+srv://...
SHOPIFY_WEBHOOK_SECRET=shpss_...
GEMINI_API_KEY=AIzaSy...
HUBSPOT_API_KEY=pat-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EMAIL_USER=admin@example.com
EMAIL_PASS=smtp_app_password
EMAIL_TO=alerts@example.com
FRONTEND_URL=http://localhost:5173
```

## Run locally

```bash
cd orderpulse/backend
npm install
npm start
```

```bash
cd orderpulse/frontend
npm install
npm run dev
```

## Test webhook

```bash
curl -X POST http://localhost:3001/api/webhook/test \
	-H "Content-Type: application/json" \
	-d '{
		"id": 123456789,
		"email": "customer@example.com",
		"customer": { "first_name": "John", "last_name": "Doe" },
		"total_price": "250.00",
		"line_items": [{ "id": 9876, "title": "Premium Course", "price": "250.00", "quantity": 1 }]
	}'
```