import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subscription, BehaviorSubject } from 'rxjs';

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

  private isPrideThemeActive = new BehaviorSubject<boolean>(false);
  public isPrideThemeActive$ = this.isPrideThemeActive.asObservable();

  private subscriptions: Subscription[] = [];

  // Manual tracking for proper reset
  private keyBuffer: string[] = [];
  private tapTimestamps: number[] = [];

  constructor() {}

  public watch(): void {
    // Keyboard sequence
    const keyboardSub = fromEvent<KeyboardEvent>(window, 'keydown').subscribe(
      (event) => {
        this.keyBuffer.push(event.key);

        // Keep only the last 10 keys
        if (this.keyBuffer.length > 10) {
          this.keyBuffer.shift();
        }

        // Check for Konami code
        if (
          this.keyBuffer.length === 10 &&
          JSON.stringify(this.keyBuffer) === JSON.stringify(this.konamiCode)
        ) {
          this.toggleTheme();
          this.keyBuffer = []; // Reset after trigger
        }
      }
    );

    // Mobile: 10 taps sequence - must be quick (within 3 seconds)
    const tapSub = fromEvent<TouchEvent | MouseEvent>(window, 'click').subscribe(
      () => {
        const now = Date.now();
        this.tapTimestamps.push(now);

        // Keep only the last 10 taps
        if (this.tapTimestamps.length > 10) {
          this.tapTimestamps.shift();
        }

        // Check if we have 10 taps within 3 seconds
        if (this.tapTimestamps.length === 10) {
          const first = this.tapTimestamps[0];
          const last = this.tapTimestamps[9];

          if (last - first < 3000) {
            this.toggleTheme();
            this.tapTimestamps = []; // Reset after trigger
          }
        }
      }
    );

    this.subscriptions.push(keyboardSub, tapSub);
  }

  private toggleTheme(): void {
    this.isPrideThemeActive.next(!this.isPrideThemeActive.value);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
