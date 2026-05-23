const { normalizeAiResult } = require('../utils/classify');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetchImpl }) => fetchImpl(...args));

const SYSTEM_PROMPT = `You are an e-commerce analyst. Analyze the order and respond ONLY with valid JSON (no markdown, no explanation) in this format: { summary: string (2 sentences max), classification: 'VIP' | 'new' | 'risky', reason: string (1 sentence), fraud_hints: string[] }.

VIP hints:
- Customer has spent > $500 total OR order value > $200.

Risky hints:
- Multiple high-value items shipped to a different billing address.
- First-time customer with order > $150.
- Suspicious email pattern (random chars before @).`;

const DEFAULT_RESPONSE = {
  classification: 'new',
  summary: 'Order received.',
  reason: 'AI unavailable',
  fraud_hints: [],
};

const analyzeOrder = async (order) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(order) },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Missing Groq response content');
    }

    const parsed = JSON.parse(content);
    return normalizeAiResult(parsed);
  } catch (error) {
    console.error('Groq AI error', error);
    return normalizeAiResult(DEFAULT_RESPONSE);
  }
};

module.exports = {
  analyzeOrder,
};
