import { Component, inject, input } from '@angular/core';

import { AlertController, IonButton } from '@ionic/angular/standalone';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, RefreshCwIcon } from 'lucide-angular';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { ExpertDraftService } from '../services/expert-draft.service';
import { GuidedDraftService } from '../services/guided-draft.service';

@Component({
  selector: 'app-calculator-refresh-button',
  templateUrl: './calculator-refresh-button.component.html',
  styleUrls: ['./calculator-refresh-button.component.scss'],
  imports: [LucideAngularModule, IonButton, TranslatePipe],
  standalone: true,
})
export class CalculatorRefreshButtonComponent {
  private readonly expertDraft = inject(ExpertDraftService);
  private readonly guidedDraft = inject(GuidedDraftService);
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
          handler: () => this.newCalculation(),
        },
      ],
    });
    await alert.present();
  }

  private newCalculation(): void {
    if (this.path() === CalculatorPath.GUIDED) {
      this.guidedDraft.newCalculation();
      return;
    }

    this.expertDraft.newCalculation();
  }
}
