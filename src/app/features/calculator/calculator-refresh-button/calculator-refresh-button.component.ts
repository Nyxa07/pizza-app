import { Component, inject, input } from '@angular/core';

import { AlertController, IonButton } from '@ionic/angular/standalone';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, RefreshCwIcon } from 'lucide-angular';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { CalculatorInitializerService } from '../services/calculator-initializer.service';

@Component({
  selector: 'app-calculator-refresh-button',
  templateUrl: './calculator-refresh-button.component.html',
  styleUrls: ['./calculator-refresh-button.component.scss'],
  imports: [LucideAngularModule, IonButton, TranslatePipe],
  standalone: true,
})
export class CalculatorRefreshButtonComponent {
  private readonly paths = inject(CalculatorInitializerService);
  private readonly alertController = inject(AlertController);
  private readonly translate = inject(TranslateService);

  readonly path = input.required<CalculatorPath>();

  protected readonly RefreshCwIcon = RefreshCwIcon;

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
          // Only the path this button sits on: the other calculations stay.
          handler: () => this.paths.newCalculation(this.path()),
        },
      ],
    });
    await alert.present();
  }
}
