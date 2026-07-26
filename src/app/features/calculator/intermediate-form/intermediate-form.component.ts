import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonRange,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, map, Observable } from 'rxjs';

import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from 'src/app/features/sheets/info-sheet-button/info-sheet-button.component';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import { RelativeDayPipe } from 'src/app/shared/pipes/relative-day.pipe';
import { TimePipe } from 'src/app/shared/pipes/time.pipe';

import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import { CalculatorMethodPreviewComponent } from '../parts/calculator-method-preview.component';
import { CalculatorTileComponent } from '../parts/calculator-tile.component';
import { CalculatorTimelineComponent } from '../parts/calculator-timeline.component';
import { sizeRange } from '../pizza-format.model';
import { INTERMEDIATE_CALCULATOR_SETTINGS } from '../services/calculator-initializer.service';
import { CalculatorService } from '../services/calculator.service';
import { IntermediateDraftService } from '../services/intermediate-draft.service';
import { IntermediateInputAdapter } from '../services/intermediate-input.adapter';
import {
  IMethodPreview,
  MethodPreviewService,
} from '../services/method-preview.service';

/** The rest slider: one question — how long do you have? — in whole hours. */
export const REST_TIME_BOUNDS = { min: 1, max: 48 } as const;

/** The kitchens the temperature stepper covers, shared with Expert. */
const TEMPERATURE_BOUNDS = { min: 19, max: 36 } as const;

/**
 * Everything the template shows, derived once per Draft/engine emission. The
 * screen never computes a recipe value itself: the adapter and the engine do.
 */
interface IntermediateVm {
  draft: IIntermediateCalculatorDraft;
  input: ICalculatorInput;
  isPoolish: boolean;
  methodSheetId: InfoSheetId;
  total: number;
  split: { flour: number; water: number; salt: number; yeast: number };
  weight: number;
  hydrationPct: number;
  ambientHours: number;
  coldHours: number;
  /** The size bounds of the current style — 10 steps Neapolitan, 8 Roman. */
  sizeBounds: { min: number; max: number };
  preview: IMethodPreview;
}

/**
 * The Intermediate path (issue #99): one short form for the user who thinks
 * in pizzas rather than in baker's percentages. Style, count, size, method,
 * rest, temperature and yeast — everything else is pinned and invisible, and
 * derived by IntermediateInputAdapter.
 */
@Component({
  selector: 'app-intermediate-form',
  templateUrl: './intermediate-form.component.html',
  styleUrls: ['./intermediate-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    IonRange,
    IonSelect,
    IonSelectOption,
    TranslatePipe,
    NumberPipe,
    RelativeDayPipe,
    TimePipe,
    InfoSheetButtonComponent,
    CalculatorMethodPreviewComponent,
    CalculatorTileComponent,
    CalculatorTimelineComponent,
  ],
})
export class IntermediateFormComponent {
  private readonly state = inject(IntermediateDraftService);
  private readonly adapter = inject(IntermediateInputAdapter);
  private readonly calculator = inject(CalculatorService);
  private readonly methodPreview = inject(MethodPreviewService);
  private readonly router = inject(Router);

  protected readonly InfoSheetId = InfoSheetId;
  protected readonly restBounds = REST_TIME_BOUNDS;

  /**
   * The style comes first and is chosen on the result in the mouth, not on a
   * technical name — so it gets plain-language choices, not a select.
   */
  protected readonly pizzaTypes = Object.values(PizzaType).map((type) => ({
    value: type,
    label: `calculator.enums.pizzaTypes.${type}`,
    description: `calculator.guided.options.${type}`,
  }));

  protected readonly doughTypes = Object.values(DoughType).map((type) => ({
    value: type,
    label: `calculator.enums.doughTypes.${type}`,
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

  private readonly input$: Observable<ICalculatorInput> = this.state
    .getDraft$()
    .pipe(map((draft) => this.adapter.resolve(draft)));

  /** The resolved input, saved as-is by the Dough saver so it replays in Expert. */
  protected readonly resolvedInput$ = this.input$;

  protected readonly vm$: Observable<IntermediateVm> = combineLatest([
    this.state.getDraft$(),
    this.input$,
    this.calculator.resultsFor$(INTERMEDIATE_CALCULATOR_SETTINGS, this.input$),
  ]).pipe(map(([draft, input, output]) => this.buildVm(draft, input, output)));

  protected selectPizzaType(pizzaType: PizzaType): void {
    // The Draft re-seats the size in the new style; the weight follows.
    this.state.update({ pizzaType });
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

  protected stepBalls(vm: IntermediateVm, dir: 1 | -1): void {
    this.state.update({ nbPizzas: Math.max(1, vm.draft.nbPizzas + dir) });
  }

  protected canStepBalls(vm: IntermediateVm, dir: 1 | -1): boolean {
    return dir === 1 || vm.draft.nbPizzas > 1;
  }

  protected stepSize(vm: IntermediateVm, dir: 1 | -1): void {
    // The Draft clamps to the style; this only keeps the stepper honest.
    this.state.update({ sizeCm: vm.draft.sizeCm + dir });
  }

  protected canStepSize(vm: IntermediateVm, dir: 1 | -1): boolean {
    return dir === 1
      ? vm.draft.sizeCm < vm.sizeBounds.max
      : vm.draft.sizeCm > vm.sizeBounds.min;
  }

  protected stepTemperature(vm: IntermediateVm, dir: 1 | -1): void {
    this.state.update({ temperature: vm.draft.temperature + dir });
  }

  protected canStepTemperature(vm: IntermediateVm, dir: 1 | -1): boolean {
    return dir === 1
      ? vm.draft.temperature < TEMPERATURE_BOUNDS.max
      : vm.draft.temperature > TEMPERATURE_BOUNDS.min;
  }

  protected stepRest(vm: IntermediateVm, dir: 1 | -1): void {
    this.setRest(vm.draft.globalRestTime + dir);
  }

  protected canStepRest(vm: IntermediateVm, dir: 1 | -1): boolean {
    return dir === 1
      ? vm.draft.globalRestTime < REST_TIME_BOUNDS.max
      : vm.draft.globalRestTime > REST_TIME_BOUNDS.min;
  }

  protected onRestSlide(event: Event): void {
    const { value } = (
      event as CustomEvent<{ value: number | { lower: number } }>
    ).detail;
    this.setRest(typeof value === 'number' ? value : value.lower);
  }

  protected goToMethod(): void {
    this.router.navigate(['/tabs/calculator/method/intermediate']);
  }

  private setRest(hours: number): void {
    this.state.update({
      globalRestTime: Math.min(
        REST_TIME_BOUNDS.max,
        Math.max(REST_TIME_BOUNDS.min, Math.round(hours)),
      ),
    });
  }

  private buildVm(
    draft: IIntermediateCalculatorDraft,
    input: ICalculatorInput,
    output: ICalculatorOutput,
  ): IntermediateVm {
    const isPoolish = draft.doughType === DoughType.POOLISH;
    const restPart = isPoolish ? output.poolish : output.dough;
    const total = output.total;

    return {
      draft,
      input,
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
      ambientHours: Math.round(restPart.rtRestTime),
      coldHours: Math.round(restPart.coldRestTime),
      sizeBounds: sizeRange(draft.pizzaType),
      preview: this.methodPreview.buildPreview(input, output, new Date()),
    };
  }
}
