import {
  Component,
  computed,
  Input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
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
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, SaveIcon } from 'lucide-angular';
import { CalculatorInput } from '../services/calculator-state.service';
import { CalculatorStateSaveManagerService } from '../services/calculator-state-save-manager.service';
import { JsonPipe } from '@angular/common';

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
    IonItemSliding,
    IonItemOption,
    IonItemOptions,
    ReactiveFormsModule,
  ],
})
export class CalculatorStateSaverComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonToast) toast!: IonToast;
  toastMessage = signal('');

  readonly SaveIcon = SaveIcon;
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

  protected stateName = computed<string>(
    () => this.form.controls.stateName.value ?? '',
  );

  constructor(
    private stateSaveManagerService: CalculatorStateSaveManagerService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.savedStates.set(this.stateSaveManagerService.listSavedStates());
  }

  cancel() {
    this.modal.dismiss();
  }

  saveNewState() {
    if (!this.stateName()) {
      return;
    }
    this.stateSaveManagerService.saveState(this.stateName());
    this.savedStates.set(this.stateSaveManagerService.listSavedStates());
    this.toastMessage.set('calculator.stateSaver.form.stateSaved');
    this.toast.present();
    this.form.reset();
  }

  overrideState(state: { name: string; input: CalculatorInput }) {
    this.stateSaveManagerService.saveState(state.name);
    this.savedStates.set(this.stateSaveManagerService.listSavedStates());
    this.toastMessage.set('calculator.stateSaver.form.stateOverridden');
    this.toast.present();
  }

  loadState(state: { name: string; input: CalculatorInput }) {
    this.stateSaveManagerService.loadState(state.name);
    this.toastMessage.set('calculator.stateSaver.form.stateLoaded');
    this.toast.present();
  }

  deleteState(state: { name: string; input: CalculatorInput }) {
    this.stateSaveManagerService.deleteState(state.name);
    this.savedStates.set(this.stateSaveManagerService.listSavedStates());
    this.toastMessage.set('calculator.stateSaver.form.stateDeleted');
    this.toast.present();
    this.form.patchValue({ stateName: this.stateName() });
  }
}
