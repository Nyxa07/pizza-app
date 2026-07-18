import { Component, inject } from '@angular/core';

import { IonButton } from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, RefreshCwIcon } from 'lucide-angular';

import { CalculatorStateService } from '../services/calculator-state.service';

@Component({
  selector: 'app-calculator-refresh-button',
  templateUrl: './calculator-refresh-button.component.html',
  styleUrls: ['./calculator-refresh-button.component.scss'],
  imports: [LucideAngularModule, IonButton, TranslatePipe],
  standalone: true,
})
export class CalculatorRefreshButtonComponent {
  private readonly calculatorState = inject(CalculatorStateService);
  protected readonly RefreshCwIcon = RefreshCwIcon;

  protected refresh() {
    this.calculatorState.newCalculation();
  }
}
