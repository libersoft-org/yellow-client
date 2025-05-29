declare module '@grafana/faro-web-sdk' {
  export interface FaroConfig {
    url: string;
    app: {
      name: string;
      version: string;
      environment: string;
    };
    instrumentations?: any[];
  }

  export function initializeFaro(config: FaroConfig): void;
  export function getWebInstrumentations(): any[];
}

declare module '@grafana/faro-web-tracing' {
  export class TracingInstrumentation {
    constructor();
  }
}
