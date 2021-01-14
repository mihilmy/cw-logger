/**
 * Common metric names used internally
 *
 * _NOTE: Users should create a union of this and their own metric names for unification across the application_
 */
export type MetricNames = "Latency" | "Interactions" | "Invocations" | "Errors";

/**
 * Library specific representation of a metric object that gets converted into the EMF format
 */
export class Metric<MetricName extends string = MetricNames> {
  namespace?: string;
  timestamp?: Date;
  name: MetricName;
  value: number = 1;
  unit: MetricUnit = "Count";
  dimensions?: Record<string, string>;
}

/**
 * The CloudWatch embedded metric format is a JSON specification used to instruct CloudWatch Logs to automatically extract metric values
 * embedded in structured log events. You can use CloudWatch to graph and create alarms on the extracted metric values.
 */
export class EmbeddedMetric {
  _aws: MetricMetadata;
  [refKey: string]: any;

  constructor(props: { metrics: Metric[]; namespace: string; context?: Record<string, any> }) {
    this._aws = new MetricMetadata(this, props.metrics, props.namespace);

    for (const [contextKey, contextValue] of Object.entries(props.context || {})) {
      this[contextKey] = contextValue;
    }
  }
}

export class MetricMetadata {
  /**
   * A number representing the time stamp used for metrics extracted from the event. Values MUST be expressed as the number of milliseconds
   * after Jan 1, 1970 00:00:00 UTC.
   */
  Timestamp: number;

  /**
   *  An array of MetricDirective Object used to instruct CloudWatch to extract metrics from the root node of the LogEvent
   */
  CloudWatchMetrics: MetricDirective[];

  constructor(emfObject: EmbeddedMetric, metrics: Metric[], namespace: string) {
    this.Timestamp = metrics[0]?.timestamp?.getTime() ?? Date.now();
    this.CloudWatchMetrics = metrics.map((metric) => new MetricDirective(emfObject, metric, namespace));
  }
}

export class MetricDirective {
  /**
   * A string representing the CloudWatch namespace for the metric.
   *
   * @link https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Namespace
   */
  Namespace: string;

  /**
   * An array of strings containing the dimension keys that will be applied to all metrics in the document. DimensionSet MUST NOT contain
   * more than 9 dimension keys but may be empty.
   */
  Dimensions: DimensionSetArray;

  /**
   * An array of MetricDefinition objects. This array MUST NOT contain more than 100 MetricDefinition objects.
   *
   * @link https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html#CloudWatch_Embedded_Metric_Format_Specification_structure_metricdefinition
   */
  Metrics: MetricDefinition[];

  constructor(emfObject: EmbeddedMetric, metric: Metric, namespace: string) {
    const { name, unit, value, dimensions = {} } = metric;
    this.Namespace = metric.namespace ?? namespace;
    this.Metrics = [{ Name: name, Unit: unit }];
    this.Dimensions = [[]];

    // Map the metric name to the target value according to the specification
    emfObject[name] = value;

    // Populate the dimensions
    for (const [dimKey, dimValue] of Object.entries(dimensions)) {
      this.Dimensions[0].push(dimKey);
      emfObject[dimKey] = dimValue;
    }
  }
}

export class MetricDefinition {
  /**
   * A string Reference Values to a metric Target Members. Metric targets MUST be either a numeric value or an array of numeric values.
   */
  Name: string;

  /**
   * An OPTIONAL string value representing the unit of measure for the corresponding metric. Values SHOULD be valid CloudWatch metric units.
   */
  Unit: MetricUnit;
}

/**
 * A 2D array where each set of strings creates a unique filter. The values within this array must also be members on the root-node—referred
 * to as the Target Members. The target member MUST have a string value. The target member defines a dimension that will be published as
 * part of the metric identity. Every DimensionSet used creates a new metric in CloudWatch.
 *
 * @link https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html#CloudWatch_Embedded_Metric_Format_Specification_structure_dimensionset
 */
export type DimensionSetArray = string[][];

/**
 * Defines what unit you want to use when storing the metric
 *
 * @link https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_MetricDatum.html
 */
export type MetricUnit =
  | "Seconds"
  | "Microseconds"
  | "Milliseconds"
  | "Bytes"
  | "Kilobytes"
  | "Megabytes"
  | "Gigabytes"
  | "Terabytes"
  | "Bits"
  | "Kilobits"
  | "Megabits"
  | "Gigabits"
  | "Terabits"
  | "Percent"
  | "Count"
  | "Bytes/Second"
  | "Kilobytes/Second"
  | "Megabytes/Second"
  | "Gigabytes/Second"
  | "Terabytes/Second"
  | "Bits/Second"
  | "Kilobits/Second"
  | "Megabits/Second"
  | "Gigabits/Second"
  | "Terabits/Second"
  | "Count/Second"
  | "None";
