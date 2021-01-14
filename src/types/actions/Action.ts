import { Metric } from "../Metrics";

export abstract class Action {
  context: Record<string, any>;

  constructor(props: { context?: Record<string, any> }) {
    this.context = Object.assign({}, props.context);
  }

  abstract emit(): Promise<Metric[]>;
}
