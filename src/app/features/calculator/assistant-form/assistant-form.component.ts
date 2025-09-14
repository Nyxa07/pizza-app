import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CalculatorStateService } from '../services/calculator-state.service';
import { YeastType } from '../enums/yeast-type.enum';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonFooter,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LucideAngularModule,
  XIcon,
  ChevronLeft,
  PlayIcon,
  CheckIcon,
  ChevronRight,
} from 'lucide-angular';
import { Router } from '@angular/router';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface IAssistantData {
  pizzaType: PizzaType;
  doughType: DoughType;
  nbPizzas: number;
  temperature: number;
  yeastType: YeastType;
  flourStrenghKnowledge: boolean;
  flourStrength: number;
  hasLongRestTime: boolean;
  restTime: number;
  rtRestTime: number;
  coldRestTime: number;
  pizzaWeight: number;
}

@Component({
  selector: 'app-assistant-form',
  templateUrl: './assistant-form.component.html',
  styleUrls: ['./assistant-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    TranslatePipe,
    LucideAngularModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonFooter,
    CommonModule,
    IonProgressBar,
  ],
})
export class AssistantFormComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  assistantForm = this.fb.group({
    pizzaType: this.fb.control<PizzaType | null>(null, Validators.required),

    doughType: this.fb.control<DoughType | null>(null, Validators.required),

    nbPizzas: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),

    temperature: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(40),
    ]),

    yeastType: this.fb.control<YeastType | null>(null, Validators.required),

    hasLongRestTime: this.fb.control<boolean | null>(null, Validators.required),
    restTime: this.fb.control<number | null>(null, Validators.required),
    rtRestTime: this.fb.control<number | null>(null, Validators.required),
    coldRestTime: this.fb.control<number | null>(null, Validators.required),

    flourStrenghKnowledge: this.fb.control<boolean | null>(
      null,
      Validators.required,
    ),
    flourStrength: this.fb.control<number | null>(null, Validators.required),

    pizzaWeight: this.fb.control<number | null>(null, Validators.required),
  });

  PlayIcon = PlayIcon;
  XIcon = XIcon;
  ChevronLeft = ChevronLeft;
  CheckIcon = CheckIcon;
  ChevronRight = ChevronRight;

  protected steps = [
    {
      load: () =>
        import('./steps/pizza-type-step.component').then(
          (m) => m.PizzaTypeStepComponent,
        ),
      key: 'pizzaType',
      canProceed: () =>
        this.assistantForm.get('pizzaType')?.valid &&
        this.assistantForm.get('pizzaWeight')?.valid,
    },
    {
      load: () =>
        import('./steps/flour-type-step.component').then(
          (m) => m.FlourTypeStepComponent,
        ),
      key: 'flourType',
      canProceed: () => this.assistantForm.get('flourStrength')?.valid,
    },
    {
      load: () =>
        import('./steps/temperature-step.component').then(
          (m) => m.TemperatureStepComponent,
        ),
      key: 'temperature',
      canProceed: () => this.assistantForm.get('temperature')?.valid,
    },
    {
      load: () =>
        import('./steps/dough-type-step.component').then(
          (m) => m.DoughTypeStepComponent,
        ),
      key: 'doughType',
      canProceed: () => this.assistantForm.get('doughType')?.valid,
    },
    {
      load: () =>
        import('./steps/planner-step.component').then(
          (m) => m.PlannerStepComponent,
        ),
      key: 'planner',
      canProceed: () =>
        this.assistantForm.get('hasLongRestTime')?.valid &&
        this.assistantForm.get('hasLongRestTime')?.valid &&
        this.assistantForm.get('coldRestTime')?.valid,
    },
    {
      load: () =>
        import('./steps/quantity-step.component').then(
          (m) => m.QuantityStepComponent,
        ),
      key: 'quantity',
      canProceed: () => this.assistantForm.get('nbPizzas')?.valid,
    },
    {
      load: () =>
        import('./steps/yeast-type-step.component').then(
          (m) => m.YeastTypeStepComponent,
        ),
      key: 'yeastType',
      canProceed: () => this.assistantForm.get('yeastType')?.valid,
    },
    {
      load: () =>
        import('./steps/summary-step.component').then(
          (m) => m.SummaryStepComponent,
        ),
      key: 'summary',
      canProceed: () => this.assistantForm.valid,
    },
  ];

  protected currentStepIndex = signal(0);
  protected currentStepComponent = signal<any | null>(null);
  protected currentStep = computed(() => this.steps[this.currentStepIndex()]);
  protected canGoBack = computed(() => this.currentStepIndex() > 0);
  // protected canProceed = computed(
  //   () =>
  //     this.currentStepIndex() < this.steps.length - 1 &&
  //     this.currentStep().canProceed(),
  // );
  protected isLastStep = computed(
    () => this.currentStepIndex() === this.steps.length - 1,
  );
  protected progressValue = computed(() => {
    const tick = 1 / (this.steps.length - 1);
    return tick * this.currentStepIndex();
  });

  constructor(
    private state: CalculatorStateService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.assistantForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const assistantData = this.assistantForm
        .value as unknown as IAssistantData;
      this.state.update({
        pizzaType: assistantData.pizzaType,
        doughType: assistantData.doughType,
        nbPizzas: assistantData.nbPizzas,
        temperature: assistantData.temperature,
        yeastType: assistantData.yeastType,
        rtRestTime: assistantData.rtRestTime,
        coldRestTime: assistantData.coldRestTime,
        flourStrength: assistantData.flourStrength,
        pizzaWeight: assistantData.pizzaWeight,
      });
    });
  }

  async ngOnInit() {
    this.reset();
    this.proceed(0);
  }

  canProceed() {
    return this.currentStep().canProceed();
  }

  async runAssistantFlow() {
    this.modal.present();
  }

  reset() {
    this.assistantForm.reset();
  }

  applyConfiguration() {
    this.modal.dismiss();
    this.router.navigate(['/tabs/calculator/results']);
  }

  dismissModal() {
    this.modal.dismiss();
  }

  async goBack() {
    this.currentStepIndex.update((prev) => prev - 1);
    this.currentStepComponent.set(await this.currentStep().load());
  }

  async proceed(stepIndex?: number) {
    if (stepIndex === undefined && this.isLastStep()) {
      return this.applyConfiguration();
    }
    this.currentStepIndex.update((prev) => stepIndex ?? prev + 1);
    this.currentStepComponent.set(await this.currentStep().load());
  }

  get inputs() {
    return {
      parentGroup: this.assistantForm,
    };
  }
}
