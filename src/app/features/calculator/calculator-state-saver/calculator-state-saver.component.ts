import { Component, Input, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  ],
})
export class CalculatorStateSaverComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonToast) toast!: IonToast;
  toastMessage = signal('');

  readonly SaveIcon = SaveIcon;
  protected stateName = signal('');
  protected savedStates = signal<{ name: string; input: CalculatorInput }[]>(
    [],
  );
  constructor(
    private stateSaveManagerService: CalculatorStateSaveManagerService,
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
    this.stateName.set('');
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
  }
}
