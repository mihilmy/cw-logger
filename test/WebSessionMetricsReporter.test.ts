import * as nock from "nock";

import { BasicAggregator, Timer, WebSessionMetricsReporter } from "../src";
import { sleep, SpotifyPlayerMetrics } from "./TestUtils";

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
  const aggregator = new BasicAggregator();
  const reporter = new WebSessionMetricsReporter<SpotifyPlayerMetrics>({ aggregator, logsEndpoint, logGroupName, flushFrequency, namespace: "WebsiteMetrics" });
  await reporter.startReporting("mihilmy");

  const timer = new Timer();
  // Metrics that need multi dimension support should use a metrics object or class
  reporter.addCount(SpotifyPlayerMetrics.CurrentStreams);
  reporter.addDuration(SpotifyPlayerMetrics.SessionLength, 200);
  // As you can see having this written in your application code can be mess best to use a metrics class
  reporter.addMetric({
    unit: "Count",
    name: SpotifyPlayerMetrics.AlbumClicks,
    value: 10,
    dimensions: {
      "AlbumName": "If You're Reading This It's Too Late",
      "Artist": "Drake"
    }
  });

  // Calculates the time from when a certain operation started
  reporter.addTime(SpotifyPlayerMetrics.BufferLatency, timer);
  // Validate that actions are available from the GetLogs API
  expect(aggregator.getLogs()).toHaveLength(4);
  // Sleep until the metrics are flushed
  await sleep(flushFrequency + 1);
  // Validate that there are no logs stored
  expect(aggregator.getLogs()).toHaveLength(0);
  // Stop reporting so that there are no open handles
  reporter.stopReporting();
}, 15000);
