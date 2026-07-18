import { Component, OnInit, inject, signal } from '@angular/core';
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

import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { CalculatorStateSaverComponent } from 'src/app/features/calculator/calculator-state-saver/calculator-state-saver.component';
import { ExpertFormComponent } from 'src/app/features/calculator/expert-form/expert-form.component';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
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
    IonItem,
    IonSkeletonText,
    RouterLink,
    TranslatePipe,
    LucideAngularModule,
    CalculatorRefreshButtonComponent,
    CalculatorStateSaverComponent,
    ExpertFormComponent,
  ],
})
export class CalculatorExpertPage implements OnInit {
  private readonly calculatorInitializer = inject(CalculatorInitializerService);

  protected readonly SettingsIcon = SettingsIcon;
  protected isInitialized = signal(false);

  ngOnInit() {
    idleCallback(() => {
      this.calculatorInitializer.initExpert();
      this.isInitialized.set(true);
    });
  }
}
