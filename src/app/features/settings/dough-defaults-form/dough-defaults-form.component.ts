import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import {
  IonItem,
  IonList,
  IonListHeader,
  IonNote,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime } from 'rxjs';

import { EXPERT_FIELD_OPTIONS } from 'src/app/features/calculator/expert-form/expert-field-options';
import { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import {
  clampWeight,
  weightOptions,
} from 'src/app/features/calculator/pizza-format.model';
import {
  DoughDefaultsService,
  FACTORY_DEFAULTS,
} from 'src/app/features/calculator/services/dough-defaults.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

/**
 * « Mes pâtes par défaut » — the user-editable seed values every new
 * calculation starts from (issue #68). Temporarily hosted in the current
 * settings screen; moves with the v2 navigation.
 */
@Component({
  selector: 'app-dough-defaults-form',
  templateUrl: './dough-defaults-form.component.html',
  styleUrls: ['./dough-defaults-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonItem,
    IonList,
    IonListHeader,
    IonNote,
    IonSelect,
    IonSelectOption,
    NumberPipe,
    ReactiveFormsModule,
    TranslatePipe,
  ],
})
export class DoughDefaultsFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly doughDefaults = inject(DoughDefaultsService);
  private readonly seed = this.doughDefaults.getDefaults();

  // Shared with the Expert tiles so both forms walk the same value grids.
  protected readonly options = EXPERT_FIELD_OPTIONS;
  /**
   * The ball weight is the one grid bound to a style. This form does not
   * expose the style, so it reads the one its own Defaults carry.
   */
  protected readonly weightOptions = weightOptions(this.seed.pizzaType);

  protected readonly form = this.fb.nonNullable.group({
    hydrationRatio: this.seed.hydrationRatio ?? FACTORY_DEFAULTS.hydrationRatio,
    saltRatio: this.seed.saltRatio,
    // A Default saved before the style bounds existed opens on its bound,
    // never on a value the grid below no longer offers.
    pizzaWeight: clampWeight(
      this.seed.pizzaType,
      this.seed.pizzaWeight ?? FACTORY_DEFAULTS.pizzaWeight,
    ),
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(250))
      .subscribe(() => this.doughDefaults.update(this.dirtyValues()));
  }

  /**
   * Only the fields the user actually changed: an untouched field must keep
   * following FACTORY_DEFAULTS if a future release re-tunes it.
   */
  private dirtyValues(): Partial<ICalculatorInput> {
    const { hydrationRatio, saltRatio, pizzaWeight } = this.form.controls;
    const dirty: Partial<ICalculatorInput> = {};
    if (hydrationRatio.dirty) {
      dirty.hydrationRatio = hydrationRatio.value;
    }
    if (saltRatio.dirty) {
      dirty.saltRatio = saltRatio.value;
    }
    if (pizzaWeight.dirty) {
      dirty.pizzaWeight = pizzaWeight.value;
    }
    return dirty;
  }
}
