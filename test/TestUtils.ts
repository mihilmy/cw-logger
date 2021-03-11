export function sleep(seconds: number) {
  return new Promise<number>((resolve) => setTimeout(resolve, seconds * 1000));
}

export enum SpotifyPlayerMetrics {
  CurrentStreams = "CurrentStreams",
  AlbumClicks = "AlbumClicks",
  SessionLength = "SessionLength",
  BufferLatency = "BufferLatency"
}