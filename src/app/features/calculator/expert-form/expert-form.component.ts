import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, map, Observable } from 'rxjs';

import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { CalculatorPaths } from '../paths/calculator-paths.service';
import {
  clampWeight,
  sizeForWeight,
  weightOptions,
} from '../pizza-format.model';
import { CalculatorService } from '../services/calculator.service';
import {
  IMethodPreview,
  MethodPreviewService,
} from '../services/method-preview.service';
import {
  EXPERT_FIELD_OPTIONS,
  restTimePatch,
  stepInList,
} from './expert-field-options';
import { CalculatorCtaComponent } from '../parts/calculator-cta.component';
import { CalculatorLivebarComponent } from '../parts/calculator-livebar.component';
import { CalculatorMethodPreviewComponent } from '../parts/calculator-method-preview.component';
import { ICalculatorResult, summarizeOutput } from '../parts/calculator-result';
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
 * Everything the template shows, derived once per Expert Draft/engine
 * emission. Tiles display the engine's effective values and edits write
 * explicit values back into the Expert Draft.
 */
interface ExpertVm {
  input: ICalculatorInput;
  output: ICalculatorOutput;
  isPoolish: boolean;
  methodSheetId: InfoSheetId;
  /** What every path reads off one engine run. */
  result: ICalculatorResult;
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
  /** The handle of this path, captured once — never another path's Draft. */
  private readonly state = inject(CalculatorPaths).for(CalculatorPath.EXPERT);
  private readonly calculator = inject(CalculatorService);
  private readonly methodPreview = inject(MethodPreviewService);
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

  protected readonly vm$: Observable<ExpertVm> = combineLatest([
    this.state.draft$,
    this.calculator.resultsFor$(this.state.draft$),
  ]).pipe(map(([input, output]) => this.buildVm(input, output)));

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
      field === 'rtRestTime' ? vm.result.ambientHours : vm.result.coldHours,
      dir,
    );
    this.state.update(
      restTimePatch(field, next, {
        rtRestTime: vm.result.ambientHours,
        coldRestTime: vm.result.coldHours,
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
        ? vm.result.ambientHours
        : field === 'coldRestTime'
          ? vm.result.coldHours
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
      pizzaWeight: clampWeight(pizzaType, vm.result.weight),
    });
  }

  protected goToMethod(): void {
    this.router.navigate(['/tabs/calculator/method/expert']);
  }

  private buildVm(
    input: ICalculatorInput,
    output: ICalculatorOutput,
  ): ExpertVm {
    const isPoolish = input.doughType === DoughType.POOLISH;
    // The engine already clamped the weight to the style, so the screen shows
    // — and steps from — a value the style can actually produce.
    const result = summarizeOutput(output, isPoolish);

    return {
      input,
      output,
      isPoolish,
      methodSheetId: isPoolish ? InfoSheetId.POOLISH : InfoSheetId.DIRECT,
      result,
      sizeCm: sizeForWeight(input.pizzaType, result.weight),
      weightOptions: weightOptions(input.pizzaType),
      poolishRatioPct: Math.round(
        (input.poolishRatio ?? POOLISH_RATIO_FALLBACK) * 100,
      ),
      preview: this.methodPreview.buildPreview(input, output, new Date()),
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
        return vm.result.weight;
      case 'hydrationRatio':
        return vm.output.hydrationRatio;
      case 'poolishRatio':
        return vm.input.poolishRatio ?? POOLISH_RATIO_FALLBACK;
      case 'oliveOilRatio':
        return vm.input.oliveOilRatio ?? 0;
      default:
        return vm.input[field];
    }
  }
}
