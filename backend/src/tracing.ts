import process from 'process';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Use OTLP exporter if endpoint configured, otherwise console exporter (safe default)
const exporter = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  ? new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT })
  : new ConsoleSpanExporter();

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'atlas-backend'
  }),
  traceExporter: exporter,
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

sdk.start()
  .then(() => {
     
    console.log('OpenTelemetry initialized');
  })
  .catch((err) => {
     
    console.error('Error initializing OpenTelemetry', err);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
     
    console.log('Tracing terminated');
  } catch (err) {
     
    console.error('Error terminating tracing', err);
  } finally {
    process.exit(0);
  }
});
