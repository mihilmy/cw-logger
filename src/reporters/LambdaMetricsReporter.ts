import { EmbeddedMetric, Metric, MetricNames } from "../types/Metrics";
import { LambdaReporterOptions } from "../types/Options";
import { Timer } from "../misc/Timer";

/**
 * Lambda metrics reporter allow us to utilize the embedded metric format to create high cardinality metrics. Utility methods such as
 * `addCount`, `addTime` and `addDuration` are really just to support the simple use cases where one just needs to record a metric
 */
export class LambdaMetricsReporter<MetricName extends string = MetricNames> {
  constructor(private options: LambdaReporterOptions) {}

  addCount(metricName: MetricName, count: number = 1, context: Record<string, any> = {}) {
    return this.addMetric({ name: metricName, value: count, unit: "Count" }, context);
  }

  addDuration(metricName: MetricName, duration: number, context: Record<string, any> = {}) {
    return this.addMetric({ name: metricName, value: duration, unit: "Milliseconds" }, context);
  }

  addTime(metricName: MetricName, timer: Timer, context: Record<string, any> = {}) {
    return this.addDuration(metricName, timer.stop(), context);
  }

  addMetric(metric: Metric<MetricName>, context: Record<string, any> = {}) {
    return this.addMetrics([metric], context);
  }

  addMetrics(metricsList: Metric<MetricName>[], context: Record<string, any> = {}) {
    // Create an embedded metric
    const embeddedMetrics = new EmbeddedMetric({ metrics: metricsList, namespace: this.options.namespace, context });
    // Log the embedded metrics to be transformed from logs
    console.info(JSON.stringify(embeddedMetrics));

    return this;
  }
}

