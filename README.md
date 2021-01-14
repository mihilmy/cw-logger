# CloudWatch Logger

Library allows users to aggregate metrics and raw logs using the Embedded Metric Format, saving costs and providing raw data for analysis. Designed to be used on your frontend applications where each session is tracked with its own log stream, allowing a high throughput since you can update a given log stream at a rate of 5 requests/second.

# Logging Limits

1. The embedded metric format is subject to a maximum size of 256 KB.
1. The batch log events are limited to 1MB and 10,000 events.
1. Can not be more than 2 hours in the future.
1. Can not be older than 14 days.
1. Can not span more than 24 hours.
1. The log events in the batch must be in chronological order by their timestamp
1. 5 TPS hard limit on sending logs to a log group.


## API Action

An API action allows the users to record the API calls using the values below as an example:

 * Dimension: Endpoint="/GetUsers", ResponseCode="200" | MetricName: StatusCode |  MetricValue: 1 | Unit: Count
 * Dimension: Endpoint="/GetUsers" | MetricName: Latency |  MetricValue: 500 | Unit: Milliseconds

