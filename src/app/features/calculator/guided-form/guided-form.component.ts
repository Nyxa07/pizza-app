import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';

import { DoughSaverComponent } from 'src/app/features/doughs/dough-saver/dough-saver.component';

import { InfoSheetId } from '../../sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from '../../sheets/info-sheet-button/info-sheet-button.component';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { CalculatorPath } from '../enums/calculator-path.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { IGuidedCalculatorDraft } from '../interfaces/guided-calculator-draft.interface';
import { CalculatorPaths } from '../paths/calculator-paths.service';

type GuidedStepId =
  | 'pizzaType'
  | 'quantity'
  | 'doughType'
  | 'restTime'
  | 'temperature'
  | 'yeastType'
  | 'summary';

interface GuidedStep {
  readonly id: GuidedStepId;
  readonly eyebrow: string;
  readonly question: string;
  readonly description: string;
}

const GUIDED_STEPS: readonly GuidedStep[] = [
  {
    id: 'pizzaType',
    eyebrow: 'calculator.guided.steps.pizzaType.eyebrow',
    question: 'calculator.guided.steps.pizzaType.question',
    description: 'calculator.guided.steps.pizzaType.description',
  },
  {
    id: 'quantity',
    eyebrow: 'calculator.guided.steps.quantity.eyebrow',
    question: 'calculator.guided.steps.quantity.question',
    description: 'calculator.guided.steps.quantity.description',
  },
  {
    id: 'doughType',
    eyebrow: 'calculator.guided.steps.doughType.eyebrow',
    question: 'calculator.guided.steps.doughType.question',
    description: 'calculator.guided.steps.doughType.description',
  },
  {
    id: 'restTime',
    eyebrow: 'calculator.guided.steps.restTime.eyebrow',
    question: 'calculator.guided.steps.restTime.question',
    description: 'calculator.guided.steps.restTime.description',
  },
  {
    id: 'temperature',
    eyebrow: 'calculator.guided.steps.temperature.eyebrow',
    question: 'calculator.guided.steps.temperature.question',
    description: 'calculator.guided.steps.temperature.description',
  },
  {
    id: 'yeastType',
    eyebrow: 'calculator.guided.steps.yeastType.eyebrow',
    question: 'calculator.guided.steps.yeastType.question',
    description: 'calculator.guided.steps.yeastType.description',
  },
  {
    id: 'summary',
    eyebrow: 'calculator.guided.steps.summary.eyebrow',
    question: 'calculator.guided.steps.summary.question',
    description: 'calculator.guided.steps.summary.description',
  },
] as const;

/**
 * The Guided path: one plain-language decision at a time, persisted in its
 * own Draft. Hidden technical inputs are derived by the path definition.
 */
@Component({
  selector: 'app-guided-form',
  templateUrl: './guided-form.component.html',
  styleUrls: ['./guided-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    TranslatePipe,
    LucideAngularModule,
    InfoSheetButtonComponent,
    DoughSaverComponent,
  ],
})
export class GuidedFormComponent {
  /** The Path draft of this path, captured once — never another path's. */
  private readonly draft = inject(CalculatorPaths).for(CalculatorPath.GUIDED);
  private readonly router = inject(Router);

  protected readonly DoughType = DoughType;
  protected readonly InfoSheetId = InfoSheetId;
  protected readonly PizzaType = PizzaType;
  protected readonly YeastType = YeastType;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;

  protected readonly draft$ = this.draft.draft$;
  /** The Guided draft resolved to a full input, saved as-is by the Dough saver. */
  protected readonly resolvedInput = toSignal(this.draft.resolvedInput$(), {
    initialValue: null,
  });
  protected readonly restTimes = [4, 8, 12, 24, 48] as const;
  protected readonly temperatures = [18, 20, 22, 24, 26] as const;

  /** The step lives with the Draft, so a reset brings the form back here. */
  private readonly draftStepIndex = toSignal(this.draft.stepIndex$, {
    initialValue: 0,
  });
  /** The module knows nothing of the steps, so the upper bound is clamped here. */
  protected readonly currentStepIndex = computed(() =>
    Math.min(this.draftStepIndex(), GUIDED_STEPS.length - 1),
  );
  protected readonly currentStep = computed(
    () => GUIDED_STEPS[this.currentStepIndex()],
  );
  protected readonly isFirstStep = computed(
    () => this.currentStepIndex() === 0,
  );
  protected readonly isLastStep = computed(
    () => this.currentStepIndex() === GUIDED_STEPS.length - 1,
  );
  protected readonly progress = computed(
    () => ((this.currentStepIndex() + 1) / GUIDED_STEPS.length) * 100,
  );
  protected readonly stepCount = GUIDED_STEPS.length;

  protected selectPizzaType(pizzaType: PizzaType): void {
    this.draft.update({ pizzaType });
  }

  protected changeQuantity(delta: 1 | -1): void {
    const nbPizzas = Math.max(1, this.draft.snapshot().nbPizzas + delta);
    this.draft.update({ nbPizzas });
  }

  protected selectDoughType(doughType: DoughType): void {
    this.draft.update({ doughType });
  }

  protected selectRestTime(globalRestTime: number): void {
    this.draft.update({ globalRestTime });
  }

  protected selectTemperature(temperature: number): void {
    this.draft.update({ temperature });
  }

  protected selectYeastType(yeastType: YeastType): void {
    this.draft.update({ yeastType });
  }

  protected hasSuggestedRestTime(draft: IGuidedCalculatorDraft): boolean {
    return this.restTimes.some((hours) => hours === draft.globalRestTime);
  }

  protected hasSuggestedTemperature(draft: IGuidedCalculatorDraft): boolean {
    return this.temperatures.some(
      (temperature) => temperature === draft.temperature,
    );
  }

  protected previous(): void {
    if (this.isFirstStep()) {
      return;
    }
    this.draft.setStepIndex(this.currentStepIndex() - 1);
  }

  protected next(): void {
    if (this.isLastStep()) {
      return;
    }
    this.draft.setStepIndex(this.currentStepIndex() + 1);
  }

  protected openMethod(): void {
    this.router.navigate(['/tabs/calculator/method/guided']);
  }
}
