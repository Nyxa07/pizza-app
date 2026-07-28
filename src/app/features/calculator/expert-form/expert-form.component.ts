import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

import type { IMethodPreview } from 'src/app/features/method/interfaces/method-preview.interface';
import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import type { IDoughFacts } from '../facts/dough-facts.interface';
import { DoughFacts } from '../facts/dough-facts.service';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CalculatorMethods } from '../method/calculator-methods.service';
import { CalculatorPaths } from '../paths/calculator-paths.service';
import {
  clampWeight,
  sizeForWeight,
  weightOptions,
} from '../pizza-format.model';
import {
  EXPERT_FIELD_OPTIONS,
  restTimePatch,
  stepInList,
} from './expert-field-options';
import { CalculatorCtaComponent } from '../parts/calculator-cta.component';
import { CalculatorLivebarComponent } from '../parts/calculator-livebar.component';
import { CalculatorMethodPreviewComponent } from '../parts/calculator-method-preview.component';
import { CalculatorTileComponent } from '../parts/calculator-tile.component';
import { CalculatorTimelineComponent } from '../parts/calculator-timeline.component';

/** Fields stepped with a plain `state.update`, on their shared value grid. */
type SteppableField =
  | 'nbPizzas'
  | 'pizzaWeight'
  | 'hydrationRatio'
  | 'poolishRatio'
  | 'saltRatio'
  | 'honeyRatio'
  | 'oliveOilRatio'
  | 'flourStrength'
  | 'temperature';

/**
 * Everything the template shows, derived once per Expert Draft emission.
 * Tiles display the engine's effective values and edits write explicit values
 * back into the Expert Draft.
 */
interface ExpertVm {
  input: ICalculatorInput;
  isPoolish: boolean;
  methodSheetId: InfoSheetId;
  /** The figures every surface shows of this dough, off one engine run. */
  facts: IDoughFacts;
  /** The pizza the current ball weight amounts to, shown as a caption. */
  sizeCm: number;
  /** The weight grid of the current style — the only style-dependent grid. */
  weightOptions: readonly number[];
  poolishRatioPct: number;
  preview: IMethodPreview;
}

/** The poolish share the engine assumes when the Draft holds none. */
const POOLISH_RATIO_FALLBACK = 0.3;

/**
 * The Expert path (issue #71, prototype variant D): pinned live result
 * bar, parametric tile grid, fermentation timeline, folded advanced
 * options, dated Method preview and narrative CTA — all reading and writing
 * the Expert Draft through the real engine.
 */
@Component({
  selector: 'app-expert-form',
  templateUrl: './expert-form.component.html',
  styleUrls: ['./expert-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    IonSelect,
    IonSelectOption,
    TranslatePipe,
    NumberPipe,
    CalculatorCtaComponent,
    CalculatorLivebarComponent,
    CalculatorMethodPreviewComponent,
    CalculatorTileComponent,
    CalculatorTimelineComponent,
  ],
})
export class ExpertFormComponent {
  /** The Path draft of this path, captured once — never another path's. */
  private readonly state = inject(CalculatorPaths).for(CalculatorPath.EXPERT);
  private readonly doughFacts = inject(DoughFacts);
  private readonly methods = inject(CalculatorMethods);
  private readonly router = inject(Router);

  protected readonly InfoSheetId = InfoSheetId;

  protected readonly doughTypes = Object.values(DoughType).map((type) => ({
    value: type,
    label: `calculator.enums.doughTypes.${type}`,
  }));

  protected readonly pizzaTypes = Object.values(PizzaType).map((type) => ({
    value: type,
    label: `calculator.enums.pizzaTypes.${type}`,
  }));

  protected readonly yeastTypes = [
    {
      value: YeastType.DRY_ACTIVE,
      label: 'calculator.enums.yeastTypes.dryActive',
    },
    {
      value: YeastType.DRY_INSTANT,
      label: 'calculator.enums.yeastTypes.dryInstant',
    },
    { value: YeastType.FRESH, label: 'calculator.enums.yeastTypes.fresh' },
  ];

  /**
   * One stream, one image: the Draft is the whole subject, and the figures
   * are derived from it here rather than combined back in from a second
   * stream — which would render an edit against the figures preceding it.
   */
  protected readonly vm$: Observable<ExpertVm> = this.state.draft$.pipe(
    map((input) => this.buildVm(input)),
  );

  protected stepField(vm: ExpertVm, field: SteppableField, dir: 1 | -1): void {
    const next = stepInList(
      this.optionsFor(vm, field),
      this.effectiveValue(vm, field),
      dir,
    );
    this.state.update({ [field]: next });
  }

  protected stepRest(
    vm: ExpertVm,
    field: 'rtRestTime' | 'coldRestTime',
    dir: 1 | -1,
  ): void {
    const next = stepInList(
      EXPERT_FIELD_OPTIONS[field],
      field === 'rtRestTime' ? vm.facts.ambientHours : vm.facts.coldHours,
      dir,
    );
    this.state.update(
      restTimePatch(field, next, {
        rtRestTime: vm.facts.ambientHours,
        coldRestTime: vm.facts.coldHours,
      }),
    );
  }

  /** Whether a step in `dir` would move — false pins the stepper disabled. */
  protected canStep(
    vm: ExpertVm,
    field: SteppableField | 'rtRestTime' | 'coldRestTime',
    dir: 1 | -1,
  ): boolean {
    const values = this.optionsFor(vm, field);
    const current =
      field === 'rtRestTime'
        ? vm.facts.ambientHours
        : field === 'coldRestTime'
          ? vm.facts.coldHours
          : this.effectiveValue(vm, field);
    return dir === 1
      ? values[values.length - 1] > current
      : values[0] < current;
  }

  protected onDoughType(event: Event): void {
    this.state.update({
      doughType: (event as CustomEvent<{ value: DoughType }>).detail.value,
    });
  }

  protected onYeastType(event: Event): void {
    this.state.update({
      yeastType: (event as CustomEvent<{ value: YeastType }>).detail.value,
    });
  }

  /**
   * Changing the style re-seats the ball weight inside the new style: a 340 g
   * Neapolitan becomes a 210 g Roman rather than a pizza the style never makes.
   */
  protected onPizzaType(vm: ExpertVm, event: Event): void {
    const pizzaType = (event as CustomEvent<{ value: PizzaType }>).detail.value;
    this.state.update({
      pizzaType,
      pizzaWeight: clampWeight(pizzaType, vm.facts.ballWeight),
    });
  }

  protected goToMethod(): void {
    this.router.navigate(['/tabs/calculator/method/expert']);
  }

  private buildVm(input: ICalculatorInput): ExpertVm {
    const isPoolish = input.doughType === DoughType.POOLISH;
    // The ball weight comes back clamped to the style, so the screen shows —
    // and steps from — a value the style can actually produce.
    const facts = this.doughFacts.factsOf(input);

    return {
      input,
      isPoolish,
      methodSheetId: isPoolish ? InfoSheetId.POOLISH : InfoSheetId.DIRECT,
      facts,
      sizeCm: sizeForWeight(input.pizzaType, facts.ballWeight),
      weightOptions: weightOptions(input.pizzaType),
      poolishRatioPct: Math.round(
        (input.poolishRatio ?? POOLISH_RATIO_FALLBACK) * 100,
      ),
      preview: this.methods.previewFor(input),
    };
  }

  /** The grid a tile steps through — only the weight depends on the style. */
  private optionsFor(
    vm: ExpertVm,
    field: SteppableField | 'rtRestTime' | 'coldRestTime',
  ): readonly number[] {
    return field === 'pizzaWeight'
      ? vm.weightOptions
      : EXPERT_FIELD_OPTIONS[field];
  }

  /** What the tile currently shows — the engine's effective value. */
  private effectiveValue(vm: ExpertVm, field: SteppableField): number {
    switch (field) {
      case 'pizzaWeight':
        return vm.facts.ballWeight;
      case 'hydrationRatio':
        // The resolved ratio, not the percentage shown: the grid is in
        // hundredths and a rounded ratio would skip a value.
        return vm.facts.hydrationRatio;
      case 'poolishRatio':
        return vm.input.poolishRatio ?? POOLISH_RATIO_FALLBACK;
      case 'oliveOilRatio':
        return vm.input.oliveOilRatio ?? 0;
      default:
        return vm.input[field];
    }
  }
}
