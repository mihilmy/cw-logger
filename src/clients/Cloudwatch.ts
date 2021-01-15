import { CreateLogStreamRequest, InputLogEvent, PutLogEventsRequest, PutLogEventsResponse } from "aws-sdk/clients/cloudwatchlogs";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { BackOffPolicy, Retryable } from "typescript-retry-decorator";

import { CloudWatchClientOptions } from "../types/Options";
import { BaseLogRequest, MetricsRequest } from "../types/Cloudwatch";

export class CloudWatchClient {
  private logsEndpoint: string;
  private logGroupName: string;
  private sequenceToken?: string;
  private currentLogStream!: string;

  constructor(options: CloudWatchClientOptions) {
    this.logGroupName = options.logGroupName;
    this.logsEndpoint = options.logsEndpoint;
  }

  /**
   * Sends a put log events request to the cloudwatch endpoint specified, this a low level implementation interacting with public cloudwatch
   * endpoints. Method actually expects messages to be in the EMF format.
   *
   * @link https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
   */
  async putLogs(logEvents: InputLogEvent[]): Promise<void> {
    if (!logEvents || logEvents.length === 0) return;

    const putLogsRequest: PutLogEventsRequest = {
      logGroupName: this.logGroupName,
      logStreamName: this.currentLogStream,
      sequenceToken: this.sequenceToken,
      logEvents
    };

    try {
      // Perform the http request and await the next sequence token
      const httpRequest = new MetricsRequest(this.logsEndpoint, putLogsRequest);
      const { nextSequenceToken, rejectedLogEventsInfo } = await this.doRequest<PutLogEventsResponse>(httpRequest);

      // This only happens in cases when log events are more than 2 hours in the future or older than 14 days
      if (rejectedLogEventsInfo) console.debug("Rejected log events info: ", rejectedLogEventsInfo);

      // Update the sequence token for the next call
      if (nextSequenceToken) this.sequenceToken = nextSequenceToken;
    } catch (error) {
      logError(error);
    }
  }

  /**
   * Updates the current log stream that logs will be published to
   *
   * @param logStreamName name of the log stream
   */
  async updateLogStream(logStreamName: string): Promise<boolean> {
    const createStreamRequest: CreateLogStreamRequest = { logGroupName: this.logGroupName, logStreamName };

    try {
      // Perform the http request and await the next sequence token
      const httpRequest = new BaseLogRequest(this.logsEndpoint, "CreateLogStream", createStreamRequest);
      await this.doRequest(httpRequest);

      // Update the current log stream only when the request succeeds
      this.currentLogStream = logStreamName;
      return true;
    } catch (error) {
      logError(error);
      return false;
    }
  }

  /**
   * Performs the API request handling retries and errors accordingly
   *
   * @param request
   */
  @Retryable({ backOff: 5000, maxAttempts: 10, doRetry: isRetryable })
  private async doRequest<Response>(request: AxiosRequestConfig) {
    const { data } = await axios(request);
    return data as Response;
  }
}

function isRetryable(e: AxiosError) {
  return e.response?.status! >= 500;
}

function logError(e: AxiosError) {
  if (!e.isAxiosError) {
    return console.debug("Request failed due to", e);
  }

  const response = { status: e.response?.status, body: e.response?.data };
  const action = e.response?.config?.headers["X-Amz-Target"];
  console.debug(`${action} request`, e.response?.config.data);
  console.debug(`${action} response`, response);
}
