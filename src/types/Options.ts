import { Aggregator } from "./Aggregator";

export interface CloudWatchClientOptions {
  /**
   * CloudWatch Logs API Endpoint found from here: https://docs.aws.amazon.com/general/latest/gr/cwl_region.html
   */
  logsEndpoint: string;

  /**
   * Custom defined log group name to ingest the users logs
   */
  logGroupName: string;
}

export interface ReporterOptions extends CloudWatchClientOptions {
  /**
   * Interval in seconds at which to flush the metrics in the web app to be sent
   */
  flushFrequency: number;

  /**
   * Aggregates logs using a custom strategy based on clients desires
   */
  aggregator: Aggregator;
}

export interface LambdaReporterOptions {
  /**
   * Default namespace that can be overridden individually by any action emitted
   */
  namespace: string;
}
