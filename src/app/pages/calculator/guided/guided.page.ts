import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';

import { CalculatorPathSwitchComponent } from 'src/app/features/calculator/calculator-path-switch/calculator-path-switch.component';
import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { GuidedFormComponent } from 'src/app/features/calculator/guided-form/guided-form.component';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';

/** The approachable, one-question-at-a-time calculator path. */
@Component({
  selector: 'app-calculator-guided-page',
  templateUrl: './guided.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonSkeletonText,
    RouterLink,
    TranslatePipe,
    LucideAngularModule,
    CalculatorPathSwitchComponent,
    CalculatorRefreshButtonComponent,
    GuidedFormComponent,
  ],
})
export class CalculatorGuidedPage implements OnInit {
  private readonly calculatorInitializer = inject(CalculatorInitializerService);

  protected readonly SettingsIcon = SettingsIcon;
  protected readonly isInitialized = signal(false);

  ngOnInit(): void {
    idleCallback(() => {
      this.calculatorInitializer.initGuided();
      this.isInitialized.set(true);
    });
  }
}
