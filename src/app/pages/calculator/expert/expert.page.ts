import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import type { ViewWillEnter } from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';

import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { CalculatorPathSwitchComponent } from 'src/app/features/calculator/calculator-path-switch/calculator-path-switch.component';
import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { ExpertFormComponent } from 'src/app/features/calculator/expert-form/expert-form.component';
import { CalculatorPaths } from 'src/app/features/calculator/paths/calculator-paths.service';
import { DoughSaverComponent } from 'src/app/features/doughs/dough-saver/dough-saver.component';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';

/**
 * The Expert path screen (issue #71): replaces the v1 Simple and Complex
 * pages with the single dense calculator of prototype variant D.
 */
@Component({
  selector: 'app-expert-page',
  templateUrl: './expert.page.html',
  styleUrls: ['./expert.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonButton,
    IonSkeletonText,
    RouterLink,
    TranslatePipe,
    LucideAngularModule,
    CalculatorRefreshButtonComponent,
    CalculatorPathSwitchComponent,
    DoughSaverComponent,
    ExpertFormComponent,
  ],
})
export class CalculatorExpertPage implements ViewWillEnter {
  protected readonly SettingsIcon = SettingsIcon;
  protected readonly CalculatorPath = CalculatorPath;
  protected isInitialized = signal(false);
  /** The resolved Expert input, saved as-is by the Dough saver. */
  protected readonly resolvedInput = toSignal(
    inject(CalculatorPaths).for(CalculatorPath.EXPERT).resolvedInput$(),
    { initialValue: null },
  );

  // A deferred-rendering flag, nothing more: the Draft is live from the
  // moment the Calculator paths module hands its handle out.
  ionViewWillEnter(): void {
    idleCallback(() => this.isInitialized.set(true));
  }
}
