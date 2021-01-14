import { InputLogEvent } from "aws-sdk/clients/cloudwatchlogs";

export interface Aggregator {
  /**
   * Fetches or transforms the current stored logs into the unified InputLogEvent format
   */
  getLogs(): InputLogEvent[];

  /**
   * Clears the current stored logs to make room for more logs
   */
  clear(): void;
}

export interface AggregatorOptions {
  /**
   * Common metrics namespace that is used if none is provided by the action
   */
  namespace: string;
}
