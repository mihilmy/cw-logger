<p align="center">
    <img alt="CloudWatch Logger" src="https://i.imgur.com/wO8kkGz.png" height="128" />
    <h1 align="center">CloudWatch Logger</h1>
</p>

Library allows users to aggregate metrics and raw logs using the Embedded Metric Format, saving costs and providing raw data for analysis.
Designed to be used on your frontend applications where each session is tracked with its own log stream, allowing high throughput and high
cardinality metrics per user session.

## 📖 Concepts

1. `Reporter`: Responsible for reporting logs to CloudWatch every X seconds, partitioning into multiple requests if necessary and handling a
   retry strategy for throttles.
1. `Aggregator`: Collects metrics/logs throughout the session by acting as an in-memory storage layer, these are later sent to cloudwatch
   via a `Reporter`.

## 🔌 Extend It

Library was designed carefully to allow users to extend the basic usage by adding a more complex aggregation logic to optimize for costs,
you can implement the `Aggregator` interface, and the library should continue to work as expected. You have the ability to create custom 
metric classes and factories.

## 🔐 Authorization

Request and response authorization is beyond the basic reporter capability. It's recommended having an endpoint in your backend that can
proxy these requests to the cloudwatch endpoint. The most ideal design is when using it with a CloudFront distribution, and you can hookup a
request signer that passes the requests to the cloudwatch origin.

## 🌏 Web Applications

```typescript
// Step 1: Initializer a reporter instance
const reporter = new WebSessionMetricsReporter<SpotifyPlayerMetrics>({
  namespace: "WebsiteMetrics",  
  aggregator: new BasicAggregator(),
  logsEndpoint,
  logGroupName,
  flushFrequency
});
reporter.startReporting("@mihilmy");

// Step 2: Initialize handler for recording the user action
document.getElementById("save").onclick = () => reporter.addCount("SaveButtonClicks", 1);

```

```HTML
<!-- Sample markup for a simple page  -->
<body>
<div id="app">
  <input type="text" id="Address" placeholder="Add Address" />
  <button id="save">Save</button>
</div>

<script src="src/index.ts"></script>
</body>
```

## ƛ AWS Lambda

AWS Lambda makes it too easy to include custom metrics in your application, simply log the embedded metric format to your cloud watch 
logs and this will generate a metric in cloudwatch backend.

```typescript
// Add this to a shared script that multiple consumers can use
const reporter = new LambdaMetricsReporter<BackendAPIMetrics>({
  namespace: "WebsiteMetrics",
  aggregator: new BasicAggregator(),
  logsEndpoint,
  logGroupName,
  flushFrequency
});

reporter.addCount("XApiInvocations", 1); // One liner!!
```

#### CloudWatch Hard Limits

Adding these here as a reminder for how much we can optimize

1. The embedded metric format is subject to a maximum size of 256 KB.
1. The batch log events are limited to 1MB and 10,000 events.
1. Can not be more than 2 hours in the future.
1. Can not be older than 14 days.
1. Can not span more than 24 hours.
1. The log events in the batch must be in chronological order by their timestamp
1. 5 TPS hard limit on sending logs to a log group.




