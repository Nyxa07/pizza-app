import { Injectable, InjectionToken, inject } from '@angular/core';

import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { SystemBars, SystemBarsStyle } from '@capacitor/core';

interface NativeSystemBarsClients {
  readonly systemBars: Pick<typeof SystemBars, 'setStyle'>;
  readonly edgeToEdge: Pick<
    typeof EdgeToEdge,
    'setStatusBarColor' | 'setNavigationBarColor'
  >;
}

export const NATIVE_SYSTEM_BARS_CLIENTS =
  new InjectionToken<NativeSystemBarsClients>('NATIVE_SYSTEM_BARS_CLIENTS', {
    providedIn: 'root',
    factory: () => ({
      systemBars: SystemBars,
      edgeToEdge: EdgeToEdge,
    }),
  });

/**
 * Keeps the two native plugins behind one application-facing boundary.
 * Capacitor owns icon style while Capawesome remains the single owner of
 * Android bar backgrounds and WebView insets.
 */
@Injectable({ providedIn: 'root' })
export class NativeSystemBarsService {
  private readonly clients = inject(NATIVE_SYSTEM_BARS_CLIENTS);

  setStyle(style: SystemBarsStyle): Promise<void> {
    return this.clients.systemBars.setStyle({ style });
  }

  async setBackgroundColor(color: string): Promise<void> {
    await Promise.all([
      this.clients.edgeToEdge.setStatusBarColor({ color }),
      this.clients.edgeToEdge.setNavigationBarColor({ color }),
    ]);
  }
}
