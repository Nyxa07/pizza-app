import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn } from '@angular/forms';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonModal,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, SaveIcon } from 'lucide-angular';

import type { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';

import { DoughsService } from '../services/doughs.service';

/**
 * Saves a calculator input as a new named Dough document. With no `input`
 * bound, it snapshots the Expert Draft (the Expert screen behavior).
 */
@Component({
  selector: 'app-dough-saver',
  templateUrl: './dough-saver.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonModal,
    IonTitle,
    IonToast,
    IonToolbar,
    TranslatePipe,
    LucideAngularModule,
  ],
})
export class DoughSaverComponent {
  /** The input to save; when null, the Expert Draft is snapshotted instead. */
  readonly input = input<ICalculatorInput | null>(null);

  @ViewChild(IonModal) private modal!: IonModal;
  @ViewChild(IonToast) private toast!: IonToast;

  private readonly doughs = inject(DoughsService);
  private readonly fb = inject(FormBuilder);

  protected readonly SaveIcon = SaveIcon;
  protected readonly nameValidator: ValidatorFn = (control) => {
    const name = String(control.value ?? '').trim();
    if (!name) {
      return { required: true };
    }
    return this.doughs.nameExists(name) ? { doughNameExists: true } : null;
  };
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [this.nameValidator]],
  });

  protected close(): void {
    this.modal.dismiss();
  }

  protected open(): void {
    void this.modal.present();
  }

  protected save(): void {
    if (this.form.invalid) {
      return;
    }
    const name = this.form.controls.name.value;
    const input = this.input();
    if (input) {
      this.doughs.save(name, input);
    } else {
      this.doughs.saveDraft(name);
    }
    this.form.reset();
    this.modal.dismiss();
    this.toast.present();
  }
}
