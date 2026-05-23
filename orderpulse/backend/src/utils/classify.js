const normalizeClassification = (value) => {
  if (!value) {
    return 'new';
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized.includes('vip')) {
    return 'VIP';
  }

  if (normalized.includes('risk')) {
    return 'risky';
  }

  return 'new';
};

const normalizeAiResult = (result) => {
  const safeResult = result || {};
  const classification = normalizeClassification(safeResult.classification);

  return {
    summary: typeof safeResult.summary === 'string' ? safeResult.summary.trim() : 'Order received.',
    classification,
    reason: typeof safeResult.reason === 'string' ? safeResult.reason.trim() : 'AI unavailable',
    fraud_hints: Array.isArray(safeResult.fraud_hints)
      ? safeResult.fraud_hints.map((hint) => String(hint))
      : [],
  };
};

module.exports = {
  normalizeClassification,
  normalizeAiResult,
};
