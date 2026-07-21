import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { InfoSheetId } from '../../sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from '../../sheets/info-sheet-button/info-sheet-button.component';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CalculatorStateService } from '../services/calculator-state.service';

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
 * The Guided path: one plain-language decision at a time, with every answer
 * pre-filled from the shared Draft. It only patches fields it owns so a switch
 * to or from Expert can never discard advanced values.
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
  ],
})
export class GuidedFormComponent {
  private readonly state = inject(CalculatorStateService);
  private readonly router = inject(Router);
  private readonly prefs = inject(PrefsStorage);

  private readonly STEP_KEY = 'calculator:guided:step';

  protected readonly DoughType = DoughType;
  protected readonly InfoSheetId = InfoSheetId;
  protected readonly PizzaType = PizzaType;
  protected readonly YeastType = YeastType;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;

  protected readonly input$ = this.state.getInput$();
  protected readonly restTimes = [4, 8, 12, 24, 48] as const;
  protected readonly temperatures = [18, 20, 22, 24, 26] as const;

  protected readonly currentStepIndex = signal(this.loadStepIndex());
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
    this.state.update({ pizzaType });
  }

  protected changeQuantity(delta: 1 | -1): void {
    const nbPizzas = Math.max(1, this.state.getInput().nbPizzas + delta);
    this.state.update({ nbPizzas });
  }

  protected selectDoughType(doughType: DoughType): void {
    this.state.update({ doughType });
  }

  protected selectRestTime(globalRestTime: number): void {
    this.state.update({
      globalRestTime,
      rtRestTime: null,
      coldRestTime: null,
    });
  }

  protected selectTemperature(temperature: number): void {
    this.state.update({ temperature });
  }

  protected selectYeastType(yeastType: YeastType): void {
    this.state.update({ yeastType });
  }

  protected effectiveRestTime(input: ICalculatorInput): number {
    return (
      input.globalRestTime ??
      (input.rtRestTime ?? 0) + (input.coldRestTime ?? 0)
    );
  }

  protected hasSuggestedRestTime(input: ICalculatorInput): boolean {
    return this.restTimes.some(
      (hours) => hours === this.effectiveRestTime(input),
    );
  }

  protected hasSuggestedTemperature(input: ICalculatorInput): boolean {
    return this.temperatures.some(
      (temperature) => temperature === input.temperature,
    );
  }

  protected previous(): void {
    if (this.isFirstStep()) {
      return;
    }
    this.setStep(this.currentStepIndex() - 1);
  }

  protected next(): void {
    if (this.isLastStep()) {
      return;
    }
    this.setStep(this.currentStepIndex() + 1);
  }

  protected openMethod(): void {
    this.router.navigate(['/tabs/calculator/method']);
  }

  private loadStepIndex(): number {
    const persisted = this.prefs.get<number>(this.STEP_KEY) ?? 0;
    return Math.min(Math.max(0, persisted), GUIDED_STEPS.length - 1);
  }

  private setStep(index: number): void {
    this.currentStepIndex.set(index);
    this.prefs.set(this.STEP_KEY, index);
  }
}
