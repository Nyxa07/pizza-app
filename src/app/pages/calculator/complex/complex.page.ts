import { Component, OnInit, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonButton,
  IonBackButton,
  IonItem,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorFormComponent } from 'src/app/features/calculator/calculator-form/calculator-form.component';
import { RouterLink } from '@angular/router';
import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';
import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';
import { CalculatorSettingsService } from 'src/app/features/calculator/services/calculator-settings.service';

@Component({
  selector: 'calculator-complex-page',
  templateUrl: './complex.page.html',
  styleUrls: ['./complex.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    TranslatePipe,
    CalculatorFormComponent,
    IonContent,
    IonButton,
    IonBackButton,
    CalculatorRefreshButtonComponent,
    RouterLink,
    LucideAngularModule,
    IonItem,
    IonSkeletonText,
    IonButton,
    RouterLink,
    CalculatorFormComponent,
    CalculatorRefreshButtonComponent,
  ],
})
export class CalculatorComplexPage implements OnInit {
  readonly SettingsIcon = SettingsIcon;
  protected isInitialized = signal(false);

  constructor(
    private calculatorState: CalculatorStateService,
    private settings: CalculatorSettingsService,
  ) {}

  ngOnInit() {
    idleCallback(() => {
      this.settings.init('complex', {
        pizzaWeight: { auto: false, visible: true },
        saltRatio: { auto: false, visible: true },
        honeyRatio: { auto: false, visible: true },
        flourStrength: { auto: false, visible: true },
        hydrationRatio: { auto: false, visible: true },
        doughType: { auto: false, visible: true },
        poolishRatio: { auto: false, visible: true },
        yeastType: { auto: false, visible: true },
        temperature: { auto: false, visible: true },
        rtRestTime: { auto: false, visible: true },
        coldRestTime: { auto: false, visible: true },
      });
      this.calculatorState.init('complex', { rtRestTime: 16 });
      this.isInitialized.set(true);
    });
  }
}
