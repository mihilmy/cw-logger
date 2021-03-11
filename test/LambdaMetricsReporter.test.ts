import { LambdaMetricsReporter, Timer } from "../src";
import { SpotifyPlayerMetrics } from "./TestUtils";

// This can be defined in a shared file and used between the application
const MetricsReporter = new LambdaMetricsReporter<SpotifyPlayerMetrics>({ namespace: "Spotify/Player" });

test("T1: Validate that we are able to define our own metrics and log successfully", () => {
  const timer = new Timer();
  // Bread and butter these are provided to support the simple use cases of reporting metrics
  // Metrics that need multi dimension support should use a metrics object or class
  MetricsReporter.addCount(SpotifyPlayerMetrics.CurrentStreams);
  MetricsReporter.addDuration(SpotifyPlayerMetrics.SessionLength, 200);
  // As you can see having this written in your application code can be mess best to use a metrics class
  MetricsReporter.addMetric({
    unit: "Count",
    name: SpotifyPlayerMetrics.AlbumClicks,
    value: 10,
    dimensions: {
      "AlbumName": "If You're Reading This It's Too Late",
      "Artist": "Drake"
    }
  });

  // Calculates the time from when a certain operation started
  MetricsReporter.addTime(SpotifyPlayerMetrics.BufferLatency, timer);
});