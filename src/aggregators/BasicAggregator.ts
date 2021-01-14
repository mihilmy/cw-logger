import { InputLogEvent } from "aws-sdk/clients/cloudwatchlogs";

import { Aggregator, AggregatorOptions } from "../types/Aggregator";
import { Action } from "../types/actions/Action";
import { EmbeddedMetric } from "../types/Metrics";

/**
 * Basic aggregator performs a simple aggregation of the data without pre-maturely optimizing for the log size by aggregating metrics etc
 */
export class BasicAggregator implements Aggregator {
  private store: InputLogEvent[] = [];

  constructor(private options: AggregatorOptions) {}

  getLogs(): InputLogEvent[] {
    return this.store;
  }

  clear() {
    this.store = [];
  }

  async addAction(action: Action) {
    const appMetrics = await action.emit();
    const embeddedMetrics = new EmbeddedMetric({
      metrics: appMetrics,
      namespace: this.options.namespace,
      context: action.context
    });

    this.store.push({ timestamp: Date.now(), message: JSON.stringify(embeddedMetrics) });
  }
}
