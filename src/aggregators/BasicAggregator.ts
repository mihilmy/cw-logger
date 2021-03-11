import { InputLogEvent } from "aws-sdk/clients/cloudwatchlogs";

import { Aggregator } from "../types/Aggregator";
import { EmbeddedMetric } from "../types/Metrics";

/**
 * Basic aggregator performs a simple aggregation of the data without pre-maturely optimizing for the log size by aggregating metrics etc
 */
export class BasicAggregator implements Aggregator {
  private store: InputLogEvent[] = [];

  getLogs(): InputLogEvent[] {
    return this.store;
  }

  clear() {
    this.store = [];
  }

  aggregate(embeddedMetrics: EmbeddedMetric): void {
    this.store.push({ timestamp: Date.now(), message: JSON.stringify(embeddedMetrics) });
  }
}
