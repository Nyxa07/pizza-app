import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
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

import { CalculatorPathSwitchComponent } from 'src/app/features/calculator/calculator-path-switch/calculator-path-switch.component';
import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { IntermediateFormComponent } from 'src/app/features/calculator/intermediate-form/intermediate-form.component';
import { CalculatorPaths } from 'src/app/features/calculator/paths/calculator-paths.service';
import { DoughSaverComponent } from 'src/app/features/doughs/dough-saver/dough-saver.component';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';

/**
 * The Intermediate path screen (issue #99): the short form between the
 * step-by-step Guided path and the dense Expert instrument.
 */
@Component({
  selector: 'app-calculator-intermediate-page',
  templateUrl: './intermediate.page.html',
  styleUrls: ['./intermediate.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    IntermediateFormComponent,
  ],
})
export class CalculatorIntermediatePage implements ViewWillEnter {
  protected readonly SettingsIcon = SettingsIcon;
  protected readonly CalculatorPath = CalculatorPath;
  protected readonly isInitialized = signal(false);
  /** The resolved Intermediate input, saved as-is by the Dough saver. */
  protected readonly resolvedInput = toSignal(
    inject(CalculatorPaths).for(CalculatorPath.INTERMEDIATE).resolvedInput$(),
    { initialValue: null },
  );

  // A deferred-rendering flag, nothing more: the Draft is live from the
  // moment the Calculator paths module hands its Path draft out.
  ionViewWillEnter(): void {
    idleCallback(() => this.isInitialized.set(true));
  }
}
