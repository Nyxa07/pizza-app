import { Component, inject } from '@angular/core';

import { AlertController, IonButton } from '@ionic/angular/standalone';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
  private readonly alertController = inject(AlertController);
  private readonly translate = inject(TranslateService);
  protected readonly RefreshCwIcon = RefreshCwIcon;

  /** The reset wipes the shared Draft: confirm before destroying it. */
  protected async refresh() {
    const alert = await this.alertController.create({
      header: this.translate.instant('calculator.refresh.confirmTitle'),
      message: this.translate.instant('calculator.refresh.confirmBody'),
      buttons: [
        {
          text: this.translate.instant('common.actions.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('common.actions.reset'),
          role: 'destructive',
          handler: () => this.calculatorState.newCalculation(),
        },
      ],
    });
    await alert.present();
  }
}
