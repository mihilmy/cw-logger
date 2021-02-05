import { Action } from "../types/actions/Action";
import { EmbeddedMetric } from "../types/Metrics";
import { LambdaReporterOptions } from "../types/Options";

/**
 * Lambda metrics reporter allow us to utilize the embedded metric format to create high cardinality metrics
 */
export class LambdaReporter {
  constructor(private options: LambdaReporterOptions) {}

  /**
   * Reporting an action to cloudwatch metrics using the embedded metric format
   *
   * @param action a group of metrics that were done using a single action
   */
  async report(action: Action) {
    const appMetrics = await action.emit();
    const embeddedMetrics = new EmbeddedMetric({ metrics: appMetrics, namespace: this.options.namespace, context: action.context });

    console.info(embeddedMetrics);
  }
}
