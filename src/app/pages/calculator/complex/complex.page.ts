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
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';
import { CALCULATOR_MODE } from 'src/app/features/calculator/services/calculator-settings.service';
import { CalculatorStateSaverComponent } from 'src/app/features/calculator/calculator-state-saver/calculator-state-saver.component';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';

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
    CalculatorStateSaverComponent,
  ],
})
export class CalculatorComplexPage implements OnInit {
  readonly SettingsIcon = SettingsIcon;
  protected isInitialized = signal(false);

  constructor(private calculatorInitializer: CalculatorInitializerService) {}

  ngOnInit() {
    idleCallback(() => {
      this.calculatorInitializer.init(CALCULATOR_MODE.COMPLEX, {
        settings: {
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
        },
        input: {
          rtRestTime: 16,
        },
      });
      this.isInitialized.set(true);
    });
  }
}
