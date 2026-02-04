# AI Services Operational Runbooks

## Overview

This runbook provides operational procedures for managing and troubleshooting the Atlas AI Services infrastructure.

---

## 1. Health Checks

### Daily Health Check

```bash
#!/bin/bash
# Daily health check script

echo "=== Atlas AI Services Health Check ==="
echo "Date: $(date)"
echo ""

# Check overall health
echo "1. Overall Health Status:"
curl -s https://api.atlas-humanitarian.org/v2/ai/health | jq .

# Check provider status
echo ""
echo "2. Provider Status:"
curl -s https://api.atlas-humanitarian.org/v2/ai/providers | jq '.providers[] | {id, status, circuit_state}'

# Check recent metrics
echo ""
echo "3. Metrics Summary:"
curl -s "https://api.atlas-humanitarian.org/v2/ai/metrics?period=1h" | jq '.metrics'

# Check costs
echo ""
echo "4. Cost Summary (Last 24h):"
curl -s "https://api.atlas-humanitarian.org/v2/ai/metrics/cost?period=24h" | jq '.total_cost, .by_provider'
```

---

## 2. Incident Response

### High Error Rate Alert

**Symptoms:**
- Error rate > 5% for any provider
- Increased 503 responses

**Steps:**

1. Check provider status:
   ```bash
   curl -s https://api.atlas-humanitarian.org/v2/ai/providers
   ```

2. Check circuit breaker state:
   ```bash
   curl -s https://api.atlas-humanitarian.org/v2/ai/providers/openai | jq '.circuit_state'
   ```

3. View recent errors:
   ```bash
   curl -s "https://api.atlas-humanitarian.org/v2/ai/logs?level=error&limit=100"
   ```

4. If circuit is OPEN:
   ```bash
   # Wait for automatic reset (30s) or manually reset via admin
   curl -X POST https://api.atlas-humanitarian.org/v2/ai/admin/providers/openai/reset-circuit
   ```

5. If provider is degraded:
   ```bash
   # Switch to fallback provider
   curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/config \
     -H "Content-Type: application/json" \
     -d '{"primaryProvider": "anthropic"}'
   ```

---

### High Latency Alert

**Symptoms:**
- P99 latency > 3 seconds
- Increased timeout errors

**Steps:**

1. Check latency metrics:
   ```bash
   curl -s "https://api.atlas-humanitarian.org/v2/ai/metrics?period=15m" | jq '.metrics.latency'
   ```

2. Check rate limits:
   ```bash
   curl -s https://api.atlas-humanitarian.org/v2/ai/providers/openai | jq '.rate_limits'
   ```

3. If rate limited:
   ```bash
   # Wait for rate limit reset or switch provider
   curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/config \
     -H "Content-Type: application/json" \
     -d '{"fallbackProviders": ["anthropic"]}'
   ```

4. Scale horizontally if needed:
   ```bash
   # Check current instance count
   kubectl get pods -n atlas-ai
   
   # Scale up if necessary
   kubectl scale deployment ai-service -n atlas-ai --replicas=5
   ```

---

### Cost Alert

**Symptoms:**
- Daily cost exceeds budget threshold
- Unusual spending patterns

**Steps:**

1. View cost breakdown:
   ```bash
   curl -s "https://api.atlas-humanitarian.org/v2/ai/metrics/cost?group_by=model"
   ```

2. Check for anomalies:
   ```bash
   curl -s "https://api.atlas-humanitarian.org/v2/ai/metrics/cost?group_by=hour"
   ```

3. If anomaly detected:
   ```bash
   # Enable stricter rate limiting
   curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/config \
     -H "Content-Type: application/json" \
     -d '{"rateLimits": {"openai": {"requestsPerMinute": 50}}}'
   ```

4. Review usage logs:
   ```bash
   curl -s "https://api.atlas-humanitarian.org/v2/ai/logs?provider=openai&limit=500"
   ```

---

### Provider Outage

**Symptoms:**
- Provider returns 503 consistently
- Circuit breaker is OPEN
- All fallback attempts fail

**Steps:**

1. Confirm provider status:
   ```bash
   curl -s https://status.openai.com  # External status
   curl -s https://api.atlas-humanitarian.org/v2/ai/providers/openai | jq '.status'
   ```

2. Enable maintenance mode:
   ```bash
   curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/config \
     -H "Content-Type: application/json" \
     -d '{"providers": {"openai": {"enabled": false}}}'
   ```

3. Monitor remaining providers:
   ```bash
   watch -n 5 'curl -s https://api.atlas-humanitarian.org/v2/ai/providers | jq .providers[].status'
   ```

4. Notify users:
   ```bash
   # Post to status page
   curl -X POST https://status.atlas-humanitarian.org/incidents \
     -H "Content-Type: application/json" \
     -d '{"title": "AI Service Degradation", "status": "investigating"}'
   ```

5. When resolved:
   ```bash
   # Re-enable provider
   curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/config \
     -H "Content-Type: application/json" \
     -d '{"providers": {"openai": {"enabled": true}}}'
   ```

---

## 3. Configuration Management

### Update Provider Configuration

```bash
# View current configuration
curl -s https://api.atlas-humanitarian.org/v2/ai/admin/config

# Update OpenAI configuration
curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/providers/openai \
  -H "Content-Type: application/json" \
  -d '{
    "models": {
      "chat": "gpt-4",
      "completion": "gpt-3.5-turbo"
    },
    "rateLimit": {
      "requestsPerMinute": 100
    }
  }'
```

### Hot-Reload Configuration

```bash
# Trigger configuration reload
curl -X POST https://api.atlas-humanitarian.org/v2/ai/admin/config/reload

# Verify reload
curl -s https://api.atlas-humanitarian.org/v2/ai/health | jq '.configuration'
```

---

## 4. Scaling Operations

### Horizontal Scaling

```bash
# View current instances
kubectl get deployment ai-service -n atlas-ai

# Scale up
kubectl scale deployment ai-service -n atlas-ai --replicas=5

# Scale down
kubectl scale deployment ai-service -n atlas-ai --replicas=3

# Auto-scale based on CPU
kubectl autoscale deployment ai-service -n atlas-ai \
  --cpu-percent=70 \
  --min=3 \
  --max=10
```

### Vertical Scaling (Memory/CPU)

```bash
# Update resource limits
kubectl patch deployment ai-service -n atlas-ai \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"ai-service","resources":{"limits":{"memory":"2Gi","cpu":"2"},"requests":{"memory":"1Gi","cpu":"1"}}}]}}}}'
```

---

## 5. Logging & Debugging

### View Request Logs

```bash
# View logs with correlation ID
curl -s "https://api.atlas-humanitarian.org/v2/ai/logs?correlation_id=req-12345-abcde"

# View error logs
curl -s "https://api.atlas-humanitarian.org/v2/ai/logs?level=error&limit=200"

# View provider-specific logs
curl -s "https://api.atlas-humanitarian.org/v2/ai/logs?provider=openai&limit=100"
```

### Enable Debug Mode

```bash
# Temporarily enable debug logging
curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/config \
  -H "Content-Type: application/json" \
  -d '{"observability": {"logLevel": "debug"}}'
```

---

## 6. Disaster Recovery

### Full Provider Outage Recovery

1. **Enable offline mode:**
   ```bash
   curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/config \
     -H "Content-Type: application/json" \
     -d '{"mode": "offline", "fallback": "cached"}'
   ```

2. **Clear circuit breakers:**
   ```bash
   curl -X POST https://api.atlas-humanitarian.org/v2/ai/admin/circuit-breakers/reset
   ```

3. **Restore from cache:**
   ```bash
   # View cached responses
   curl -s https://api.atlas-humanitarian.org/v2/ai/cache/stats
   
   # Clear stale cache if needed
   curl -X DELETE https://api.atlas-humanitarian.org/v2/ai/cache
   ```

4. **Restore normal mode:**
   ```bash
   curl -X PATCH https://api.atlas-humanitarian.org/v2/ai/admin/config \
     -H "Content-Type: application/json" \
     -d '{"mode": "online"}'
   ```

---

## 7. Monitoring Dashboard

### Key Metrics to Watch

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|-------------------|-------------------|--------|
| Error Rate | > 1% | > 5% | Check provider status |
| P99 Latency | > 2s | > 5s | Scale or switch provider |
| Cost/Hour | > $50 | > $100 | Review usage patterns |
| Queue Size | > 100 | > 500 | Scale workers |
| Circuit Breakers | 1 open | 2+ open | Provider investigation |

### Grafana Dashboard Import

```json
{
  "dashboard": {
    "title": "Atlas AI Services",
    "tags": ["ai", "atlas"],
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(ai_requests_total[5m])",
            "legendFormat": "{{provider}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(ai_errors_total[5m]) / rate(ai_requests_total[5m])",
            "legendFormat": "{{provider}}"
          }
        ]
      },
      {
        "title": "Latency P99",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, rate(ai_latency_bucket[5m]))",
            "legendFormat": "{{provider}}"
          }
        ]
      }
    ]
  }
}
```

---

## 8. Rollback Procedures

### Rollback Deployment

```bash
# View deployment history
kubectl rollout history deployment ai-service -n atlas-ai

# Rollback to previous version
kubectl rollout undo deployment ai-service -n atlas-ai

# Rollback to specific version
kubectl rollout undo deployment ai-service -n atlas-ai --to-revision=5
```

### Rollback Configuration

```bash
# View config history
curl -s https://api.atlas-humanitarian.org/v2/ai/admin/config/history

# Rollback config
curl -X POST https://api.atlas-humanitarian.org/v2/ai/admin/config/rollback \
  -d '{"revision": "config-v2"}'
```

---

## 9. Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| Platform On-Call | @platform-oncall | First response |
| AI Services Lead | @ai-team-lead | Technical decisions |
| DevOps | @devops-team | Infrastructure |
| Vendor Support | OpenAI: enterprise@openai.com | Provider issues |

---

## 10. Post-Incident Checklist

After any incident:

- [ ] Document timeline of events
- [ ] Identify root cause
- [ ] Update runbooks if needed
- [ ] Add new alerts if gap identified
- [ ] Schedule retrospective
- [ ] Update status page with findings
- [ ] Review and update SLAs
