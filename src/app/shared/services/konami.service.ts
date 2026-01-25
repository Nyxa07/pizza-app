import { inject, Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

import { ThemeService } from 'src/app/features/settings/services/theme.service';
import { SecretTheme } from 'src/app/features/settings/enums/secret-theme.enum';

/**
 * Service that listens for the Konami code (keyboard or mobile taps)
 * and toggles secret themes via ThemeService.
 *
 * Keyboard: ↑ ↑ ↓ ↓ ← → ← → B A
 * Mobile: 10 quick taps within 3 seconds
 */
@Injectable({
  providedIn: 'root',
})
export class KonamiService implements OnDestroy {
  private readonly themeService = inject(ThemeService);

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

  private subscriptions: Subscription[] = [];

  // Manual tracking for proper reset
  private keyBuffer: string[] = [];
  private tapTimestamps: number[] = [];

  /**
   * Start listening for Konami code input.
   * Call this once during app initialization.
   */
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
          this.activateEasterEgg();
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
            this.activateEasterEgg();
            this.tapTimestamps = []; // Reset after trigger
          }
        }
      }
    );

    this.subscriptions.push(keyboardSub, tapSub);
  }

  /**
   * Toggle the Pride theme when easter egg is triggered.
   * Extend this method to cycle through multiple themes if desired.
   */
  private activateEasterEgg(): void {
    this.themeService.toggleSecretTheme(SecretTheme.Konami);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
