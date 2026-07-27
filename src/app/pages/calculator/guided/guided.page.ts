import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
import { GuidedFormComponent } from 'src/app/features/calculator/guided-form/guided-form.component';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';

/** The approachable, one-question-at-a-time calculator path. */
@Component({
  selector: 'app-calculator-guided-page',
  templateUrl: './guided.page.html',
  styleUrls: ['./guided.page.scss'],
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
    CalculatorPathSwitchComponent,
    CalculatorRefreshButtonComponent,
    GuidedFormComponent,
  ],
})
export class CalculatorGuidedPage implements ViewWillEnter {
  protected readonly SettingsIcon = SettingsIcon;
  protected readonly CalculatorPath = CalculatorPath;
  protected readonly isInitialized = signal(false);

  // A deferred-rendering flag, nothing more: the Draft is live from the
  // moment the Calculator paths module hands its Path draft out.
  ionViewWillEnter(): void {
    idleCallback(() => this.isInitialized.set(true));
  }
}
