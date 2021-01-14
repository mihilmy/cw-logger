import { AxiosError, AxiosPromise } from "axios";

import { Metric, MetricNames } from "../Metrics";
import { Action } from "./Action";

export class InterAction extends Action {
  private componentName: string;

  constructor(props: { component: string; context?: Record<string, any> }) {
    super(props);
    this.componentName = props.component;
  }

  async emit(): Promise<Metric[]> {
    return [new InterActionMetric(this.componentName)];
  }
}

export class InterActionMetric extends Metric {
  constructor(component: string) {
    super();
    this.name = "Interactions";
    this.dimensions = { ComponentName: component };
  }
}
