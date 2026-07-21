import { Component, inject, signal } from '@angular/core';
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
import { ExpertFormComponent } from 'src/app/features/calculator/expert-form/expert-form.component';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
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
  private readonly calculatorInitializer = inject(CalculatorInitializerService);

  protected readonly SettingsIcon = SettingsIcon;
  protected isInitialized = signal(false);

  // Ionic caches this page in the router-outlet stack, so ngOnInit does not
  // re-run when returning from the Guided path. Re-assert the Expert settings
  // on every entry, otherwise fields stay stuck in Guided's `auto` mode and
  // look blocked — hydration most visibly (issue #79).
  ionViewWillEnter(): void {
    idleCallback(() => {
      this.calculatorInitializer.initExpert();
      this.isInitialized.set(true);
    });
  }
}
