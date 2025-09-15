import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { CalculatorSettingsService } from './calculator-settings.service';
import { CalculatorStateService } from './calculator-state.service';
import { Injectable } from '@angular/core';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CALCULATOR_MODE } from '../enums/calculator-mode.enum';

@Injectable({ providedIn: 'root' })
export class CalculatorStateSaveManagerService {
  private readonly STORAGE_KEY = 'calculator';
  private mode: CALCULATOR_MODE = CALCULATOR_MODE.SIMPLE;

  constructor(
    private prefs: PrefsStorage,
    private settings: CalculatorSettingsService,
    private state: CalculatorStateService,
  ) {}

  init(mode: CALCULATOR_MODE): void {
    this.mode = mode;
  }

  saveState(name: string): void {
    const saveKey = this.STORAGE_KEY + ':' + this.mode + ':states';
    const savedStates =
      this.prefs.get<{ name: string; input: ICalculatorInput }[]>(saveKey) ??
      [];

    const existingStateIndex = savedStates.findIndex((s) => s.name === name);
    const stateToSave = {
      name,
      input: this.state.getInput(),
    };

    if (existingStateIndex !== -1) {
      savedStates[existingStateIndex] = stateToSave;
    } else {
      savedStates.push(stateToSave);
    }

    this.prefs.set(saveKey, savedStates);
  }

  loadState(name: string): void {
    const savedStates = this.listSavedStates();
    const state = savedStates.find((s) => s.name === name);

    if (state) {
      this.state.update(state.input);
    }
  }

  deleteState(name: string): void {
    const savedStates = this.listSavedStates();
    const stateIndex = savedStates.findIndex((s) => s.name === name);
    if (stateIndex !== -1) {
      savedStates.splice(stateIndex, 1);
    }
    this.prefs.set(this.STORAGE_KEY + ':' + this.mode + ':states', savedStates);
  }

  listSavedStates(): { name: string; input: ICalculatorInput }[] {
    const saveKey = this.STORAGE_KEY + ':' + this.mode + ':states';
    return (
      this.prefs
        .get<{ name: string; input: ICalculatorInput }[]>(saveKey)
        ?.sort((a, b) => a.name.localeCompare(b.name)) ?? []
    );
  }
}
