import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonListHeader,
  IonModal,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { Share } from '@capacitor/share';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, Share2Icon } from 'lucide-angular';

import type { IMethod } from 'src/app/features/method/interfaces/method.interface';
import { MethodTextService } from 'src/app/features/method/services/method-text.service';

@Component({
  selector: 'app-calculator-state-share',
  templateUrl: './calculator-state-share.component.html',
  styleUrls: ['./calculator-state-share.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonList,
    IonListHeader,
    IonModal,
    IonTitle,
    IonToggle,
    IonToolbar,
    ReactiveFormsModule,
    TranslatePipe,
    LucideAngularModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorStateShareComponent {
  readonly method = input<IMethod | null>(null);

  @ViewChild(IonModal) private modal?: IonModal;

  protected readonly ShareIcon = Share2Icon;
  protected readonly form = inject(FormBuilder).group({
    onlyIngredients: [false],
    withHelperDescriptions: [false],
  });

  private readonly methodText = inject(MethodTextService);
  private readonly translate = inject(TranslateService);

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value.onlyIngredients) {
        this.form.controls.withHelperDescriptions.disable({ emitEvent: false });
      } else {
        this.form.controls.withHelperDescriptions.enable({ emitEvent: false });
      }
    });
  }

  protected async confirm(): Promise<void> {
    await this.share();
    await this.modal?.dismiss();
  }

  protected async cancel(): Promise<void> {
    await this.modal?.dismiss();
  }

  private async share(): Promise<void> {
    const method = this.method();
    if (!method) {
      return;
    }

    const text = this.methodText.getText(method, {
      withHelperDescriptions: !!this.form.value.withHelperDescriptions,
      onlyIngredients: !!this.form.value.onlyIngredients,
    });

    await Share.share({
      title: this.translate.instant('calculator.share.title'),
      text,
      dialogTitle: this.translate.instant('calculator.share.dialogTitle'),
    });
  }
}
