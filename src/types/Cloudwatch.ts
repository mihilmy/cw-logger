import { AxiosRequestConfig, Method } from "axios";
import { PutLogEventsRequest } from "aws-sdk/clients/cloudwatchlogs";

/**
 * Base of cloudwatch logging API requests
 */
export class BaseLogRequest<T> implements AxiosRequestConfig {
  url: string;
  headers: Record<string, string>;
  data: string;
  method: Method;

  constructor(url: string, action: Action, payload: T) {
    this.url = url;
    this.data = JSON.stringify(payload);
    this.method = "POST";
    this.headers = {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `Logs_20140328.${action}`
    };
  }
}

/**
 * Embedded logged metrics request
 */
export class MetricsRequest extends BaseLogRequest<PutLogEventsRequest> {
  constructor(url: string, payload: PutLogEventsRequest) {
    super(url, "PutLogEvents", payload);
    this.headers["x-amzn-logs-format"] = "json/emf";
  }
}

export type Action = "CreateLogStream" | "PutLogEvents";
