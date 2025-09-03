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

  constructor(private calculatorState: CalculatorStateService) {}

  ngOnInit() {
    idleCallback(() => {
      this.calculatorState.init('complex', { rtRestTime: 16 });
      this.isInitialized.set(true);
    });
  }
}
