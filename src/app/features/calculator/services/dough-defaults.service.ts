import { Injectable, inject } from '@angular/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { fallbackWeight } from '../pizza-format.model';

/** The style every factory Default is expressed in. */
const FACTORY_PIZZA_TYPE = PizzaType.NEAPOLITAN;

/**
 * Factory seed for the user's Defaults (« Mes pâtes par défaut »). Only a
 * fallback: user-customised values are persisted and win over these.
 * `satisfies` keeps the literal (non-null) field types for consumers.
 */
export const FACTORY_DEFAULTS = {
  nbPizzas: 5,
  doughType: DoughType.DIRECT,
  yeastType: YeastType.DRY_ACTIVE,
  hydrationRatio: 0.62,
  temperature: 20,
  globalRestTime: 24,
  rtRestTime: 16,
  coldRestTime: 0,
  poolishRatio: 0.4,
  flourStrength: 270,
  saltRatio: 0.028,
  honeyRatio: 0.004,
  // Derived, not written: the pizza format model owns every ball weight.
  pizzaWeight: fallbackWeight(FACTORY_PIZZA_TYPE),
  pizzaType: FACTORY_PIZZA_TYPE,
  oliveOilRatio: 0,
} satisfies ICalculatorInput;

/**
 * The user's Defaults (« Mes pâtes par défaut ») — the seed values every new
 * calculation starts from (ADR-0002). Editing a Default never touches the
 * current Draft; it only applies from the next new calculation on.
 */
@Injectable({ providedIn: 'root' })
export class DoughDefaultsService {
  private readonly STORAGE_KEY = 'calculator:defaults';
  private readonly prefs = inject(PrefsStorage);

  getDefaults(): ICalculatorInput {
    return { ...FACTORY_DEFAULTS, ...this.loadCustomised() };
  }

  update(partial: Partial<ICalculatorInput>): void {
    // Persist only the user's overrides so FACTORY_DEFAULTS can still evolve.
    this.prefs.set(this.STORAGE_KEY, { ...this.loadCustomised(), ...partial });
  }

  private loadCustomised(): Partial<ICalculatorInput> {
    return this.prefs.get<Partial<ICalculatorInput>>(this.STORAGE_KEY) ?? {};
  }
}
