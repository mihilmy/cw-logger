import { CloudWatchClient } from "../clients/Cloudwatch";

import { Aggregator } from "../types/Aggregator";
import { ReporterOptions } from "../types/Options";

/**
 * Simple logs reporter that will send the logs to cloudwatch, if the logs follow the EmbeddedMetricFormat standard then they will be transformed
 * into metrics by cloudwatch. Recommend using the aggregator to extend functionality not already provided by the basic implementation.
 */
export class BasicReporter {
  private frequency: number;
  private cloudwatch: CloudWatchClient;
  private aggregator: Aggregator;
  private poller: any;

  constructor(options: ReporterOptions) {
    this.frequency = options.flushFrequency * 1000;
    this.cloudwatch = new CloudWatchClient(options);
    this.aggregator = options.aggregator;
  }

  /**
   * Starts reporting by setting up a log stream using the session name provided. Proceeding to setting up a continuous poller that will
   * fetch seek the logs from the aggregator every flush frequency and will issue a put logs request.
   *
   * @param sessionName Name of the session where all of the users logs will end up
   */
  async startReporting(sessionName: string) {
    // Create a unique log stream name by using the combination of the date and the user friendly name provided
    const [year, month, day, hours, minutes, seconds, millis] = new Date().toISOString().split(/[-:.TZ]/);
    const logStreamName = `${sessionName}/${year}/${month}/${day}/${hours}/${minutes}/${seconds}.${millis}`;

    // Update the log stream name within the application
    const success = await this.cloudwatch.updateLogStream(logStreamName);
    if (!success) {
      return console.debug("Failed to start reporting logs, error was during log stream creation 😢");
    }

    // Start the poller that will flush the logs every N seconds to cloudwatch to the specified log stream
    this.poller = setInterval(() => this.flush(), this.frequency);
    console.debug("Starting session reporter using log stream name", logStreamName);
  }

  /**
   * Stops the reporting by clearing the interval being run
   */
  stopReporting() {
    clearInterval(this.poller);
  }

  /**
   * Flushes the stored local logs if any exist to CloudWatch
   */
  flush() {
    const logs = [...this.aggregator.getLogs()];
    this.aggregator.clear();
    this.cloudwatch.putLogs(logs);
  }
}
