/**
 * Simple timer class that will start running as soon as a new instance is constructed
 */
export class Timer {
  private startTime: Date = new Date();
  private endTime: Date;

  stop(): number {
    this.endTime = new Date();
    return this.endTime.getTime() - this.startTime.getTime();
  }
}