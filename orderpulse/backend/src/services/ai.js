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

const GEMINI_MODEL = 'gemini-2.5-flash';

const analyzeOrder = async (order) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nOrder:\n${JSON.stringify(order)}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('Missing Gemini response content');
    }

    const parsed = JSON.parse(content);
    return normalizeAiResult(parsed);
  } catch (error) {
    console.error('Gemini AI error', error);
    return normalizeAiResult(DEFAULT_RESPONSE);
  }
};

module.exports = {
  analyzeOrder,
};
