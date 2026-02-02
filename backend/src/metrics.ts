import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

const register = new client.Registry();

register.setDefaultLabels({ service: process.env.SERVICE_NAME || 'atlas-backend' });

// Collect default metrics (CPU/memory/eventloop)
client.collectDefaultMetrics({ register, prefix: 'atlas_' });

// HTTP request duration histogram
export const httpRequestDuration = new client.Histogram({
  name: 'atlas_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

// HTTP requests counter
export const httpRequestCounter = new client.Counter({
  name: 'atlas_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestCounter);

// Middleware to measure requests
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const route = req.route && req.route.path ? req.route.path : req.path;
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const status = String(res.statusCode);
    httpRequestCounter.inc({ method: req.method, route, status });
    end({ method: req.method, route, status });
  });

  next();
}

export async function metricsEndpoint(req: Request, res: Response) {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err: any) {
    res.status(500).end(err.message);
  }
}

export default { register, metricsMiddleware, metricsEndpoint };
