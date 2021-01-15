import * as nock from "nock";

import { CloudWatchClient } from "../src/clients/Cloudwatch";

const logGroupName = "WebsiteLogs";
const logsEndpoint = "https://logs.us-east-1.amazonaws.com";
const CORSHeaders = {
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "X-Amz-Target, x-amzn-logs-format"
};
const UnavailableResponse = { __type: "ServiceUnavailableException", message: "The service cannot complete the request" };
nock(logsEndpoint).persist().options("/").reply(200, undefined, CORSHeaders);
nock(logsEndpoint).persist().post("/").reply(500, UnavailableResponse, CORSHeaders);

test("T1: Validate that retries are working on 5xx", async () => {
  const client = new CloudWatchClient({ logGroupName, logsEndpoint });
  const start = new Date();
  await client.updateLogStream("LogStreamName");
  const end = new Date();

  expect(end.valueOf() - start.valueOf()).toBeGreaterThanOrEqual(10 * 5000);
}, 60000);
