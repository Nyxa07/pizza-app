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
import { CalculatorStateSaverComponent } from 'src/app/features/calculator/calculator-state-saver/calculator-state-saver.component';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
import { CALCULATOR_MODE } from 'src/app/features/calculator/enums/calculator-mode.enum';

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
  protected CALCULATOR_MODE = CALCULATOR_MODE;

  constructor(private calculatorInitializer: CalculatorInitializerService) {}

  ngOnInit() {
    idleCallback(() => {
      this.calculatorInitializer.initComplex();
      this.isInitialized.set(true);
    });
  }
}
