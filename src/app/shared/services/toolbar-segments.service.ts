import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToolbarSegmentsService {
  private segments = signal<{ name: string; value: string }[]>([]);

  constructor() {}

  setSegments(segments: { name: string; value: string }[]) {
    this.segments.set(segments);
  }

  getSegments() {
    return this.segments;
  }
}
