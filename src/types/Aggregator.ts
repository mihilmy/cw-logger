import { InputLogEvent } from "aws-sdk/clients/cloudwatchlogs";

export interface Aggregator {
  getLogs(): InputLogEvent[];
  clear(): void;
}

export interface AggregatorOptions {
  namespace: string;
}
