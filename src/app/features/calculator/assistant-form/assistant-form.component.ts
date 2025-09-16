import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  query,
  group,
} from '@angular/animations';
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
  CheckIcon,
  ChevronRight,
} from 'lucide-angular';
import { Router } from '@angular/router';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

export interface IAssistantData {
  pizzaType: PizzaType;
  doughType: DoughType;
  nbPizzas: number;
  temperature: number;
  yeastType: YeastType;
  flourStrenghKnowledge: boolean;
  flourStrength: number;
  hasLongRestTime: boolean;
  globalRestTime: number;
}

@Component({
  selector: 'app-assistant-form',
  templateUrl: './assistant-form.component.html',
  styleUrls: ['./assistant-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  animations: [
    trigger('slideAnimation', [
      transition('* => forward', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({ transform: 'translateX(0)', opacity: 1 }),
        ),
      ]),
      transition('* => backward', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({ transform: 'translateX(0)', opacity: 1 }),
        ),
      ]),
    ]),
  ],
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
    globalRestTime: this.fb.control<number | null>(null, Validators.required),

    flourStrenghKnowledge: this.fb.control<boolean | null>(
      null,
      Validators.required,
    ),
    flourStrength: this.fb.control<number | null>(null, Validators.required),
  });

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
      canProceed: () => this.assistantForm.get('pizzaType')?.valid,
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
        this.assistantForm.get('globalRestTime')?.valid,
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
  protected animationState = signal<'forward' | 'backward' | 'none'>('none');
  protected isAnimating = signal(false);
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
    private prefStorage: PrefsStorage,
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
        globalRestTime: assistantData.globalRestTime,
        flourStrength: assistantData.flourStrength,
      });
      // Store form data
      this.prefStorage.set('assistant:data', this.assistantForm.value);
    });

    // Store step index
    effect(() => {
      this.prefStorage.set(
        'assistant:currentStepIndex',
        this.currentStepIndex(),
      );
    });

    this.assistantForm
      .get('flourStrenghKnowledge')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value === true) {
          this.assistantForm.get('flourStrength')?.setValue(270);
        } else {
          this.assistantForm.get('flourStrength')?.setValue(180);
        }
      });
  }

  async ngOnInit() {
    const assistantData = this.prefStorage.get('assistant:data');
    const currentStepIndex =
      this.prefStorage.get('assistant:currentStepIndex') ?? 0;

    if (assistantData && currentStepIndex) {
      this.assistantForm.patchValue(assistantData);
      // Load without animation on init
      this.currentStepIndex.set(currentStepIndex as number);
      this.currentStepComponent.set(await this.currentStep().load());
    } else {
      // Load first step without animation
      this.currentStepComponent.set(await this.currentStep().load());
    }
  }

  canProceed() {
    return this.currentStep().canProceed();
  }

  async runAssistantFlow() {
    this.reset();
    this.modal.present();
  }

  async continueAssistantFlow() {
    this.modal.present();
  }

  async reset() {
    this.assistantForm.reset();
    this.currentStepIndex.set(0);
    this.currentStepComponent.set(await this.currentStep().load());
    this.animationState.set('none');
    this.isAnimating.set(false);
  }

  applyConfiguration() {
    this.modal.dismiss();
    this.router.navigate(['/tabs/calculator/results']);
  }

  dismissModal() {
    this.modal.dismiss();
  }

  async goBack() {
    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    this.animationState.set('backward');
    this.currentStepIndex.update((prev) => prev - 1);
    this.currentStepComponent.set(await this.currentStep().load());
  }

  async proceed(stepIndex?: number) {
    if (stepIndex === undefined && this.isLastStep()) {
      return this.applyConfiguration();
    }

    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    const direction =
      stepIndex !== undefined && stepIndex < this.currentStepIndex()
        ? 'backward'
        : 'forward';
    this.animationState.set(direction);
    this.currentStepIndex.update((prev) => stepIndex ?? prev + 1);
    this.currentStepComponent.set(await this.currentStep().load());
  }

  onAnimationDone() {
    this.isAnimating.set(false);
    this.animationState.set('none');
  }

  get inputs() {
    return {
      parentGroup: this.assistantForm,
    };
  }
}
