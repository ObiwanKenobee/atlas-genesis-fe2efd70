import { evaluateAction } from '../services/ethics';

// Middleware factory to check request body with the values engine before proceeding.
export function requireValuesCheck(fieldPath = '') {
  return (req: any, res: any, next: any) => {
    const payload = fieldPath ? req.body[fieldPath] : req.body;
    const evalRes = evaluateAction({ payload, actor: req.body.actor || null });
    if (evalRes.recommendedAction === 'block') {
      return res.status(403).json({ code: 'blocked_by_policy', details: evalRes });
    }
    // attach evaluation for downstream logging
    req.valuesEvaluation = evalRes;
    next();
  };
}
