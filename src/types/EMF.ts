interface EmbeddedMetricFormat {
  /**
   * Used to represent metadata about the payload that informs downstream services how they should process the log event
   */
  _aws: MetricMetadata;

  /**
   * Key value pairs to be used to reference the values defined with the metric metadata object either dimensions or metric values
   */
  [referenceValue: string]: string | number | number[] | MetricMetadata;
}

interface MetricMetadata {
  /**
   * A number representing the time stamp used for metrics extracted from the event. Values MUST be expressed as the number of milliseconds
   * after Jan 1, 1970 00:00:00 UTC.
   */
  Timestamp: number;

  /**
   *  An array of MetricDirective Object used to instruct CloudWatch to extract metrics from the root node of the LogEvent
   */
  CloudWatchMetrics: MetricDirective;
}

interface MetricDirective {
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
}

interface MetricDefinition<MetricName extends string = string> {
  /**
   * A string Reference Values to a metric Target Members. Metric targets MUST be either a numeric value or an array of numeric values.
   */
  Name: MetricName;

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
type DimensionSetArray = string[][];

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
