import { Component, OnInit, signal, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import {
  IonButton,
  IonModal,
  IonInput,
  IonContent,
  IonItem,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonList,
  IonListHeader,
  IonLabel,
  IonToast,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, SaveIcon, EllipsisIcon } from 'lucide-angular';
import { CalculatorInput } from '../services/calculator-state.service';
import { CalculatorStateSaveManagerService } from '../services/calculator-state-save-manager.service';
import { Dialog } from '@capacitor/dialog';

@Component({
  selector: 'app-calculator-state-saver',
  templateUrl: './calculator-state-saver.component.html',
  styleUrls: ['./calculator-state-saver.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    TranslatePipe,
    IonModal,
    IonInput,
    IonButtons,
    IonContent,
    IonItem,
    IonInput,
    IonHeader,
    IonToolbar,
    IonButtons,
    FormsModule,
    LucideAngularModule,
    IonList,
    IonListHeader,
    IonLabel,
    IonToast,
    ReactiveFormsModule,
  ],
})
export class CalculatorStateSaverComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonToast) toast!: IonToast;
  toastMessage = signal('');

  readonly SaveIcon = SaveIcon;
  readonly EllipsisIcon = EllipsisIcon;
  protected savedStates = signal<{ name: string; input: CalculatorInput }[]>(
    [],
  );

  protected validation: ValidatorFn = (control) => {
    if (!control.value) {
      return { required: true };
    }
    if (this.savedStates().some((state) => state.name === control.value)) {
      return { stateNameExists: true };
    }
    return null;
  };

  protected form = this.fb.group({
    stateName: ['', [this.validation]],
  });

  constructor(
    private stateSaveManagerService: CalculatorStateSaveManagerService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private actionSheetCtrl: ActionSheetController,
  ) {}

  ngOnInit() {
    this.savedStates.set(this.stateSaveManagerService.listSavedStates());
  }

  cancel() {
    this.modal.dismiss();
  }

  saveNewState() {
    if (!this.form.valid) {
      return;
    }
    this.stateSaveManagerService.saveState(this.form.controls.stateName.value!);
    this.savedStates.set(this.stateSaveManagerService.listSavedStates());
    this.toastMessage.set('calculator.stateSaver.stateSaved');
    this.toast.present();
    this.form.reset();
  }

  overrideState(state: { name: string; input: CalculatorInput }) {
    this.stateSaveManagerService.saveState(state.name);
    this.savedStates.set(this.stateSaveManagerService.listSavedStates());
    this.toastMessage.set('calculator.stateSaver.stateOverridden');
    this.toast.present();
  }

  loadState(state: { name: string; input: CalculatorInput }) {
    this.stateSaveManagerService.loadState(state.name);
    this.toastMessage.set('calculator.stateSaver.stateLoaded');
    this.toast.present();
  }

  deleteState(state: { name: string; input: CalculatorInput }) {
    this.stateSaveManagerService.deleteState(state.name);
    this.savedStates.set(this.stateSaveManagerService.listSavedStates());
    this.toastMessage.set('calculator.stateSaver.stateDeleted');
    this.toast.present();
    this.form.patchValue({ stateName: this.form.controls.stateName.value! });
  }

  async presentActionSheet(state: { name: string; input: CalculatorInput }) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('common.actions.title'),
      buttons: [
        {
          text: this.translate.instant('common.actions.load'),
          data: {
            action: 'load',
          },
          handler: () => {
            this.loadState(state);
            this.modal.dismiss();
          },
        },
        {
          text: this.translate.instant('common.actions.override'),
          data: {
            action: 'override',
          },
          handler: async () => {
            const { value } = await Dialog.confirm({
              title: 'Confirm',
              message: this.translate.instant(
                'calculator.stateSaver.confirmOverride',
              ),
            });
            if (value) {
              this.overrideState(state);
              this.modal.dismiss();
            }
          },
        },
        {
          text: this.translate.instant('common.actions.delete'),
          role: 'destructive',
          data: {
            action: 'delete',
          },
          handler: async () => {
            const { value } = await Dialog.confirm({
              title: 'Confirm',
              message: this.translate.instant(
                'calculator.stateSaver.confirmDeletion',
              ),
            });
            if (value) {
              this.deleteState(state);
            }
          },
        },
        {
          text: this.translate.instant('common.actions.cancel'),
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }
}
