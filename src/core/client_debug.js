async function initializeFaroIfEnabled() {
 if (import.meta.env.FARO_ENABLED === 'true') {
  const { getWebInstrumentations, initializeFaro } = await import('@grafana/faro-web-sdk');
  const { TracingInstrumentation } = await import('@grafana/faro-web-tracing');

  initializeFaro({
   url: 'https://faro-collector-prod-eu-west-2.grafana.net/collect/2d78672765ea4b49bdab02a042737181',
   app: {
    name: 'yw',
    version: '1.0.0',
    environment: 'production',
   },
   instrumentations: [
    // Mandatory, omits default instrumentations otherwise.
    ...getWebInstrumentations(),
    // Tracing package to get end-to-end visibility for HTTP requests.
    new TracingInstrumentation(),
   ],
  });
 }
}

await initializeFaroIfEnabled();
