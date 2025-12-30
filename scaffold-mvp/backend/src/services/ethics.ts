type Rule = {
  id: string;
  description?: string;
  when: Record<string, any>;
  action?: 'allow' | 'block' | 'review';
  weight?: number;
};

const DEFAULT_POLICIES: Rule[] = [
  {
    id: 'no_deforestation',
    description: 'Block listings indicating deforestation',
    when: { 'payload.landUse': 'deforestation' },
    action: 'block',
    weight: 10,
  },
  {
    id: 'sensitive_biome_review',
    description: 'Flag sensitive biome activity for review',
    when: { 'payload.biome': 'peatland' },
    action: 'review',
    weight: 5,
  },
];

function getPolicies() {
  // In Phase 0 policies are in-memory; later read from DB
  return DEFAULT_POLICIES;
}

function dotGet(obj: any, path: string) {
  return path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);
}

export function evaluateAction(action: any) {
  const policies = getPolicies();
  const violations: any[] = [];
  let score = 100;

  policies.forEach((r) => {
    const when = r.when || {};
    let matched = true;
    for (const key of Object.keys(when)) {
      const expected = when[key];
      const actual = dotGet(action, key);
      if (actual === undefined) {
        matched = false;
        break;
      }
      if (expected instanceof RegExp) {
        if (!expected.test(actual)) matched = false;
      } else if (actual !== expected) {
        matched = false;
        break;
      }
    }
    if (matched) {
      violations.push({ ruleId: r.id, message: r.description, action: r.action });
      score -= (r.weight || 1) * 10;
    }
  });

  const pass = violations.length === 0;
  const recommendedAction = pass ? 'allow' : violations.some((v) => v.action === 'block') ? 'block' : 'review';
  return { score: Math.max(0, score), pass, violations, recommendedAction };
}

export function listPolicies() {
  return getPolicies();
}

export function addPolicy(rule: Rule) {
  // In Phase 0, this is a no-op or in-memory add; extend to DB in Phase 1
  DEFAULT_POLICIES.push(rule);
  return rule;
}
