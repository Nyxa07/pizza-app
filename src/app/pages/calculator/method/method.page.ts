import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { ChefHatIcon, LucideAngularModule } from 'lucide-angular';
import { combineLatest, filter, map, Observable } from 'rxjs';

import { CalculatorStateShareComponent } from 'src/app/features/calculator/calculator-state-share/calculator-state-share.component';
import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import {
  CalculatorInitializerService,
  EXPERT_CALCULATOR_SETTINGS,
  GUIDED_CALCULATOR_SETTINGS,
} from 'src/app/features/calculator/services/calculator-initializer.service';
import { CalculatorService } from 'src/app/features/calculator/services/calculator.service';
import { ExpertDraftService } from 'src/app/features/calculator/services/expert-draft.service';
import { GuidedDraftService } from 'src/app/features/calculator/services/guided-draft.service';
import { GuidedInputAdapter } from 'src/app/features/calculator/services/guided-input.adapter';
import { MethodService } from 'src/app/features/calculator/services/method.service';
import { IMethod } from 'src/app/features/method/interfaces/method.interface';
import { MethodComponent } from 'src/app/features/method/method.component';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';

/**
 * The Method screen (issue #72): the full Dough method in the v2 identity,
 * dated from the engine's timings, reached from the Expert CTA. Replaces
 * the v1 results/:mode page.
 */
@Component({
  selector: 'app-calculator-method-page',
  templateUrl: './method.page.html',
  styleUrls: ['./method.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonTitle,
    IonContent,
    IonSkeletonText,
    RouterLink,
    TranslatePipe,
    LucideAngularModule,
    CalculatorStateShareComponent,
    MethodComponent,
  ],
})
export class CalculatorMethodPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly calculator = inject(CalculatorService);
  private readonly expertDraft = inject(ExpertDraftService);
  private readonly guidedDraft = inject(GuidedDraftService);
  private readonly guidedInputAdapter = inject(GuidedInputAdapter);
  private readonly methodService = inject(MethodService);
  private readonly calculatorInitializer = inject(CalculatorInitializerService);

  private readonly methodStart = new Date();
  private readonly path = this.readPath();
  private readonly input$: Observable<ICalculatorInput> =
    this.path === CalculatorPath.GUIDED
      ? this.guidedDraft
          .getDraft$()
          .pipe(map((draft) => this.guidedInputAdapter.resolve(draft)))
      : this.expertDraft.getInput$();
  private readonly output$ = this.calculator.resultsFor$(
    this.path === CalculatorPath.GUIDED
      ? GUIDED_CALCULATOR_SETTINGS
      : EXPERT_CALCULATOR_SETTINGS,
    this.input$,
  );

  protected readonly ChefHatIcon = ChefHatIcon;
  protected readonly backHref = `/tabs/calculator/${this.path}`;
  protected readonly isInitialized = signal(false);
  protected readonly method = toSignal(
    combineLatest([this.input$, this.output$]).pipe(
      filter(([, output]) => output.total.flour > 0),
      map(([input, output]) =>
        this.methodService.build(input, output, this.methodStart),
      ),
    ),
    { initialValue: null },
  );

  ngOnInit() {
    idleCallback(() => {
      this.calculatorInitializer.initMethod(this.path);
      this.isInitialized.set(true);
    });
  }

  private readPath(): CalculatorPath {
    return this.route.snapshot.data['calculatorPath'] === CalculatorPath.GUIDED
      ? CalculatorPath.GUIDED
      : CalculatorPath.EXPERT;
  }
}
