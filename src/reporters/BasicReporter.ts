import { CloudWatchClient } from "../clients/Cloudwatch";
import { Aggregator } from "../types/Aggregator";

import { ReporterOptions } from "../types/Options";

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

  async startReporting(sessionName: string) {
    // Create a unique log stream name by using the combination of the date and the user friendly name provided
    const [year, month, day, hours, minutes, seconds, millis] = new Date().toISOString().split(/[-:.TZ]/);
    const logStreamName = `${sessionName}/${year}/${month}/${day}/${hours}/${minutes}/${seconds}.${millis}`;

    // Update the log stream name within the application
    await this.cloudwatch.updateLogStream(logStreamName);

    // Start the poller that will flush the logs every N seconds to cloudwatch to the specified log stream
    this.poller = setInterval(() => this.flush(), this.frequency);
    console.debug("Starting session reporter using log stream name", logStreamName);
  }

  stopReporting() {
    clearInterval(this.poller);
  }

  flush() {
    const logs = [...this.aggregator.getLogs()];
    this.aggregator.clear();
    this.cloudwatch.putLogs(logs);
  }
}
