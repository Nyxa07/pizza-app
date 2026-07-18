import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
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

import { DoughsService } from '../services/doughs.service';

/** Saves the current Draft as a new named Dough document from Expert. */
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

  protected save(): void {
    if (this.form.invalid) {
      return;
    }
    this.doughs.saveDraft(this.form.controls.name.value);
    this.form.reset();
    this.modal.dismiss();
    this.toast.present();
  }
}
