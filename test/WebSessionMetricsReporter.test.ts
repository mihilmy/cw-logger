import * as nock from "nock";

import { BasicAggregator, WebSessionMetricsReporter, InterAction } from "../src";
import { sleep } from "./TestUtils";

const flushFrequency = 5;
const logGroupName = "WebsiteLogs";
const logsEndpoint = "https://logs.us-east-1.amazonaws.com";
const CORSHeaders = {
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "X-Amz-Target, x-amzn-logs-format"
};

nock(logsEndpoint).persist().options("/").reply(200, undefined, CORSHeaders);
nock(logsEndpoint).persist().post("/").reply(200, { nextSequenceToken: "nextToken" }, CORSHeaders);

test("T1: Validate end to end workflow", async () => {
  const aggregator = new BasicAggregator({ namespace: "WebsiteMetrics" });
  //prettier-ignore
  const reporter = new WebSessionMetricsReporter({ aggregator, logsEndpoint, logGroupName, flushFrequency });
  reporter.startReporting("mihilmy");

  // Populate some actions into our aggregator
  await aggregator.addAction(new InterAction({ component: "Card", context: { user: "mihilmy" } }));
  await aggregator.addAction(new InterAction({ component: "SettingsButton", context: { user: "mihilmy" } }));
  // Validate that actions are available from the GetLogs API
  expect(aggregator.getLogs()).toHaveLength(2);
  // Sleep until the metrics are flushed
  await sleep(flushFrequency + 1);
  // Validate that there are no logs stored
  expect(aggregator.getLogs()).toHaveLength(0);
  // Stop reporting so that there are no open handles
  reporter.stopReporting();
}, 15000);
