import { Injectable, inject } from '@angular/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CalculatorStateService } from './calculator-state.service';

@Injectable({ providedIn: 'root' })
export class CalculatorStateSaveManagerService {
  private readonly prefs = inject(PrefsStorage);
  private readonly state = inject(CalculatorStateService);

  // Kept until the saved-Dough migration (#74). The Expert screen was the
  // former complex mode, so retaining this key preserves existing saves.
  private readonly SAVE_KEY = 'calculator:complex:states';

  saveState(name: string): void {
    const savedStates =
      this.prefs.get<{ name: string; input: ICalculatorInput }[]>(
        this.SAVE_KEY,
      ) ?? [];

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

    this.prefs.set(this.SAVE_KEY, savedStates);
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
    this.prefs.set(this.SAVE_KEY, savedStates);
  }

  listSavedStates(): { name: string; input: ICalculatorInput }[] {
    return (
      this.prefs
        .get<{ name: string; input: ICalculatorInput }[]>(this.SAVE_KEY)
        ?.sort((a, b) => a.name.localeCompare(b.name)) ?? []
    );
  }
}
