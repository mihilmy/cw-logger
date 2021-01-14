import { AxiosError, AxiosPromise } from "axios";

import { Metric } from "../Metrics";
import { Action } from "./Action";

export class APIAction extends Action {
  private invokedStartTime: Date;
  private promise: AxiosPromise;

  constructor(props: { promise: AxiosPromise; context?: Record<string, any> }) {
    super(props);
    this.promise = props.promise;
    this.invokedStartTime = new Date();
  }

  async emit(): Promise<Metric[]> {
    const { status, data, config: request } = await this.promise.catch((r: AxiosError) => r.response!);
    const latency = Date.now() - this.invokedStartTime.getTime();
    const { pathname: endpoint } = new URL(request.url!);

    if (status !== 200) {
      Object.assign(this.context, { error: data, request: request.data });
    }

    return [new InvocationMetric(endpoint, status), new LatencyMetric(endpoint, latency)];
  }
}

export class InvocationMetric extends Metric {
  constructor(endpoint: string, status: number) {
    super();
    this.name = "Invocations";
    this.dimensions = { StatusCode: status.toString(), Endpoint: endpoint };
  }
}

export class LatencyMetric extends Metric {
  constructor(endpoint: string, latency: number) {
    super();
    this.name = "Latency";
    this.value = latency;
    this.unit = "Milliseconds";
    this.dimensions = { Endpoint: endpoint };
  }
}
