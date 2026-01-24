import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subscription, merge, Subject } from 'rxjs';
import { map, bufferCount, filter, timestamp, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class KonamiService implements OnDestroy {
  private readonly konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];

  private subscription?: Subscription;

  constructor() {}

  public watch(callback: () => void): void {
    // Keyboard sequence
    const keyboard$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      map((event) => event.key),
      bufferCount(10, 1),
      filter(
        (sequence) => JSON.stringify(sequence) === JSON.stringify(this.konamiCode)
      )
    );

    // Mobile: 10 taps sequence - must be quick (within 3 seconds for the whole sequence)
    const taps$ = fromEvent<TouchEvent | MouseEvent>(window, 'click').pipe(
      timestamp(),
      bufferCount(10, 1),
      filter((events) => {
        const first = events[0].timestamp;
        const last = events[events.length - 1].timestamp;
        // 10 taps must happen within 3000ms (3 seconds)
        return last - first < 3000;
      }),
      map(() => true)
    );

    this.subscription = merge(keyboard$.pipe(map(() => true)), taps$).subscribe(
      () => {
        callback();
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
