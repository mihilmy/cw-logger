import { InputLogEvent } from "aws-sdk/clients/cloudwatchlogs";
import { EmbeddedMetric } from "./Metrics";

export interface Aggregator {
  /**
   * Fetches or transforms the current stored logs into the unified InputLogEvent format
   */
  getLogs(): InputLogEvent[];

  /**
   * Clears the current stored logs to make room for more logs
   */
  clear(): void;

  /**
   * Aggregates metrics in internal data structures, depending on metric throughput some may require complex stateful aggregation
   *
   * @param embeddedMetrics
   */
  aggregate(embeddedMetrics: EmbeddedMetric): void;
}
