import { CreateLogGroupRequest, CreateLogStreamRequest, InputLogEvent, PutLogEventsRequest, PutLogEventsResponse } from "aws-sdk/clients/cloudwatchlogs";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Retryable } from "typescript-retry-decorator";

import { CloudWatchClientOptions } from "../types/Options";
import { BaseLogRequest, CloudwatchException, MetricsRequest } from "../types/Cloudwatch";

export class CloudWatchClient {
  private readonly logsEndpoint: string;
  private readonly logGroupName: string;
  private sequenceToken?: string;
  private currentLogStream: string;

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
      return this.handleUpdateLogStreamError(error, logStreamName);
    }
  }

  /**
   * Creates a log group in case one does not already exist
   */
  async createLogGroup(): Promise<boolean> {
    const createLogGroupRequest: CreateLogGroupRequest = { logGroupName: this.logGroupName };

    try {
      // Perform the http request and await the next sequence token
      const httpRequest = new BaseLogRequest(this.logsEndpoint, "CreateLogGroup", createLogGroupRequest);
      await this.doRequest(httpRequest);
      return true;
    } catch (error) {
      return this.handleCreateLogGroupError(error);
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

  /**
   * Handles the update log stream error by creating a log group if one does not already exist
   *
   * @param e error reported by the CreateLogStream API
   * @param logStreamName name of the logstream to be used when the call to re-create is retried
   */
  private async handleUpdateLogStreamError(e: AxiosError, logStreamName: string) {
    logError(e);
    const exceptionType = e.response?.data.__type as CloudwatchException;

    if (exceptionType === "ResourceNotFoundException") {
      await this.createLogGroup();
      return await this.updateLogStream(logStreamName);
    }

    if (exceptionType === "ResourceAlreadyExistsException") {
      this.currentLogStream = logStreamName;
      return true;
    }

    return false;
  }

  /**
   * Handles create log group errors to allow the metrics reporter to proceed safely.
   *
   * __TODO__: Add handling for the rest of the errors documented [here](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogGroup.html#API_CreateLogGroup_Errors)
   * @param e error reported by the CreateLogGroup API
   */
  private async handleCreateLogGroupError(e: AxiosError) {
    logError(e);
    const exceptionType = e.response?.data.__type as CloudwatchException;

    if (exceptionType === "ResourceAlreadyExistsException") {
      return true;
    }

    return false;
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
