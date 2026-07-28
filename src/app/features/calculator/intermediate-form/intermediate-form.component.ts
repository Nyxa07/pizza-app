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

import type { IMethodPreview } from 'src/app/features/method/interfaces/method-preview.interface';
import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from 'src/app/features/sheets/info-sheet-button/info-sheet-button.component';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import type { IDoughFacts } from '../facts/dough-facts.interface';
import { DoughFacts } from '../facts/dough-facts.service';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import { CalculatorMethods } from '../method/calculator-methods.service';
import { CalculatorCtaComponent } from '../parts/calculator-cta.component';
import { CalculatorLivebarComponent } from '../parts/calculator-livebar.component';
import { CalculatorMethodPreviewComponent } from '../parts/calculator-method-preview.component';
import { CalculatorTileComponent } from '../parts/calculator-tile.component';
import { CalculatorTimelineComponent } from '../parts/calculator-timeline.component';
import { CalculatorPaths } from '../paths/calculator-paths.service';
import { sizeRange } from '../pizza-format.model';
import { EXPERT_FIELD_OPTIONS } from '../expert-form/expert-field-options';

/**
 * The rest slider: one question — how long do you have? — in whole hours.
 * It starts at 1 h, not 0: on a null rest the yeast model diverges and gets
 * capped at its ceiling, narrating a Method nobody should follow.
 */
export const REST_TIME_BOUNDS = { min: 1, max: 48 } as const;

/** The value bounds of every stepper on this screen, style-independent. */
const bounds = (values: readonly number[]) => ({
  min: values[0],
  max: values[values.length - 1],
});

/** The kitchens the temperature stepper covers, the Expert grid's own. */
const TEMPERATURE_BOUNDS = bounds(EXPERT_FIELD_OPTIONS.temperature);

/** The dough-ball count, unbounded upwards like the Guided counter. */
const BALLS_BOUNDS = { min: 1, max: Number.POSITIVE_INFINITY } as const;

/** The answers a plain ± stepper edits, each with the bounds it walks. */
type SteppableAnswer = 'nbPizzas' | 'sizeCm' | 'temperature' | 'globalRestTime';

/**
 * Everything the template shows, derived once per Draft emission. The screen
 * never computes a dough figure itself: the path and the engine do.
 */
interface IntermediateVm {
  draft: IIntermediateCalculatorDraft;
  methodSheetId: InfoSheetId;
  /** The figures every surface shows of this dough, off one engine run. */
  facts: IDoughFacts;
  /** The size bounds of the current style — 10 steps Neapolitan, 8 Roman. */
  sizeBounds: { min: number; max: number };
  preview: IMethodPreview;
}

/**
 * The Intermediate path (issue #99): one short form for the user who thinks
 * in pizzas rather than in baker's percentages. Style, count, size, method,
 * rest, temperature and yeast — everything else is pinned and invisible, and
 * derived by the path definition.
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
    InfoSheetButtonComponent,
    CalculatorCtaComponent,
    CalculatorLivebarComponent,
    CalculatorMethodPreviewComponent,
    CalculatorTileComponent,
    CalculatorTimelineComponent,
  ],
})
export class IntermediateFormComponent {
  /** The Path draft of this path, captured once — never another path's. */
  private readonly state = inject(CalculatorPaths).for(
    CalculatorPath.INTERMEDIATE,
  );
  private readonly doughFacts = inject(DoughFacts);
  private readonly methods = inject(CalculatorMethods);
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

  private readonly input$: Observable<ICalculatorInput> =
    this.state.resolvedInput$();

  protected readonly vm$: Observable<IntermediateVm> = combineLatest([
    this.state.draft$,
    this.input$,
  ]).pipe(map(([draft, input]) => this.buildVm(draft, input)));

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

  protected step(
    vm: IntermediateVm,
    answer: SteppableAnswer,
    dir: 1 | -1,
  ): void {
    const { min, max } = this.boundsOf(vm, answer);
    const next = Math.min(max, Math.max(min, vm.draft[answer] + dir));
    this.state.update({ [answer]: next });
  }

  /** Whether a step in `dir` would move — false pins the stepper disabled. */
  protected canStep(
    vm: IntermediateVm,
    answer: SteppableAnswer,
    dir: 1 | -1,
  ): boolean {
    const { min, max } = this.boundsOf(vm, answer);
    return dir === 1 ? vm.draft[answer] < max : vm.draft[answer] > min;
  }

  protected onRestSlide(event: Event): void {
    const { value } = (
      event as CustomEvent<{ value: number | { lower: number } }>
    ).detail;
    const hours = typeof value === 'number' ? value : value.lower;
    this.state.update({
      globalRestTime: Math.min(
        REST_TIME_BOUNDS.max,
        Math.max(REST_TIME_BOUNDS.min, Math.round(hours)),
      ),
    });
  }

  protected goToMethod(): void {
    this.router.navigate(['/tabs/calculator/method/intermediate']);
  }

  /** Only the size moves with the style; the rest are fixed value grids. */
  private boundsOf(
    vm: IntermediateVm,
    answer: SteppableAnswer,
  ): { min: number; max: number } {
    switch (answer) {
      case 'sizeCm':
        return vm.sizeBounds;
      case 'temperature':
        return TEMPERATURE_BOUNDS;
      case 'globalRestTime':
        return REST_TIME_BOUNDS;
      case 'nbPizzas':
        return BALLS_BOUNDS;
    }
  }

  private buildVm(
    draft: IIntermediateCalculatorDraft,
    input: ICalculatorInput,
  ): IntermediateVm {
    const isPoolish = draft.doughType === DoughType.POOLISH;

    return {
      draft,
      methodSheetId: isPoolish ? InfoSheetId.POOLISH : InfoSheetId.DIRECT,
      facts: this.doughFacts.factsOf(input),
      sizeBounds: sizeRange(draft.pizzaType),
      preview: this.methods.previewFor(input),
    };
  }
}
