import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, map, Observable } from 'rxjs';

import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import { RelativeDayPipe } from 'src/app/shared/pipes/relative-day.pipe';
import { TimePipe } from 'src/app/shared/pipes/time.pipe';

import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { CalculatorService } from '../services/calculator.service';
import { CalculatorStateService } from '../services/calculator-state.service';
import {
  IMethodPreview,
  MethodPreviewService,
} from '../services/method-preview.service';
import {
  EXPERT_FIELD_OPTIONS,
  restTimePatch,
  stepInList,
} from './expert-field-options';
import { ExpertMethodPreviewComponent } from './parts/expert-method-preview.component';
import { ExpertTileComponent } from './parts/expert-tile.component';
import { ExpertTimelineComponent } from './parts/expert-timeline.component';

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
 * Everything the template shows, derived once per Draft/engine emission.
 * Tiles display the engine's EFFECTIVE values (a Draft written by the
 * Guided path may hold nulls or only a global rest); edits write explicit
 * values back into the shared Draft.
 */
interface ExpertVm {
  input: ICalculatorInput;
  output: ICalculatorOutput;
  isPoolish: boolean;
  methodSheetId: InfoSheetId;
  total: number;
  split: { flour: number; water: number; salt: number; yeast: number };
  weight: number;
  hydrationPct: number;
  poolishRatioPct: number;
  ambientHours: number;
  coldHours: number;
  preview: IMethodPreview;
}

/** The poolish share the engine assumes when the Draft holds none. */
const POOLISH_RATIO_FALLBACK = 0.3;

/**
 * The Expert path (issue #71, prototype variant D): pinned live result
 * bar, parametric tile grid, fermentation timeline, folded advanced
 * options, dated Method preview and narrative CTA — all reading and
 * writing the single shared Draft through the real engine.
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
    RelativeDayPipe,
    TimePipe,
    ExpertMethodPreviewComponent,
    ExpertTileComponent,
    ExpertTimelineComponent,
  ],
})
export class ExpertFormComponent {
  private readonly state = inject(CalculatorStateService);
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
    this.state.getInput$(),
    this.calculator.results$,
  ]).pipe(map(([input, output]) => this.buildVm(input, output)));

  protected stepField(vm: ExpertVm, field: SteppableField, dir: 1 | -1): void {
    const next = stepInList(
      EXPERT_FIELD_OPTIONS[field],
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
      field === 'rtRestTime' ? vm.ambientHours : vm.coldHours,
      dir,
    );
    this.state.update(
      restTimePatch(field, next, {
        rtRestTime: vm.ambientHours,
        coldRestTime: vm.coldHours,
      }),
    );
  }

  /** Whether a step in `dir` would move — false pins the stepper disabled. */
  protected canStep(
    vm: ExpertVm,
    field: SteppableField | 'rtRestTime' | 'coldRestTime',
    dir: 1 | -1,
  ): boolean {
    const values = EXPERT_FIELD_OPTIONS[field];
    const current =
      field === 'rtRestTime'
        ? vm.ambientHours
        : field === 'coldRestTime'
          ? vm.coldHours
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

  protected onPizzaType(event: Event): void {
    this.state.update({
      pizzaType: (event as CustomEvent<{ value: PizzaType }>).detail.value,
    });
  }

  protected goToMethod(): void {
    this.router.navigate(['/tabs/calculator/method']);
  }

  private buildVm(
    input: ICalculatorInput,
    output: ICalculatorOutput,
  ): ExpertVm {
    const isPoolish = input.doughType === DoughType.POOLISH;
    const restPart = isPoolish ? output.poolish : output.dough;
    const total = output.total;

    return {
      input,
      output,
      isPoolish,
      methodSheetId: isPoolish ? InfoSheetId.POOLISH : InfoSheetId.DIRECT,
      total: Math.round(
        total.flour +
          total.water +
          total.salt +
          total.yeast +
          total.honey +
          total.oliveOil,
      ),
      split: {
        flour: Math.round(total.flour),
        water: Math.round(total.water),
        salt: Math.round(total.salt),
        yeast: Math.round(total.yeast * 10) / 10,
      },
      weight: Math.round(output.pizzaBalls.weight),
      hydrationPct: Math.round(output.hydrationRatio * 100),
      poolishRatioPct: Math.round(
        (input.poolishRatio ?? POOLISH_RATIO_FALLBACK) * 100,
      ),
      ambientHours: Math.round(restPart.rtRestTime),
      coldHours: Math.round(restPart.coldRestTime),
      preview: this.methodPreview.buildPreview(input, output, new Date()),
    };
  }

  /** What the tile currently shows — the engine's effective value. */
  private effectiveValue(vm: ExpertVm, field: SteppableField): number {
    switch (field) {
      case 'pizzaWeight':
        return vm.weight;
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
