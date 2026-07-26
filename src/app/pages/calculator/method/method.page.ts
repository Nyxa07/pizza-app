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
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
import { CalculatorService } from 'src/app/features/calculator/services/calculator.service';
import { MethodService } from 'src/app/features/calculator/services/method.service';
import { DoughSaverComponent } from 'src/app/features/doughs/dough-saver/dough-saver.component';
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
    DoughSaverComponent,
    MethodComponent,
  ],
})
export class CalculatorMethodPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly calculator = inject(CalculatorService);
  private readonly methodService = inject(MethodService);
  private readonly calculatorInitializer = inject(CalculatorInitializerService);

  private readonly methodStart = new Date();
  private readonly path = this.readPath();
  // The path registry resolves the Draft and the engine settings, so this
  // screen never has to know which Draft services exist.
  private readonly input$: Observable<ICalculatorInput> =
    this.calculatorInitializer.resolvedInput$(this.path);
  private readonly output$ = this.calculator.resultsFor$(
    this.calculatorInitializer.settingsFor(this.path),
    this.input$,
  );

  protected readonly ChefHatIcon = ChefHatIcon;
  protected readonly backHref = `/tabs/calculator/${this.path}`;
  protected readonly isInitialized = signal(false);
  /** The resolved input of the current path, saved as-is by the Dough saver. */
  protected readonly currentInput = toSignal(this.input$, {
    initialValue: null,
  });
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
      this.calculatorInitializer.init(this.path);
      this.isInitialized.set(true);
    });
  }

  /** Unrouted or unknown Method links land on Expert, as they always have. */
  private readPath(): CalculatorPath {
    const routed = this.route.snapshot.data['calculatorPath'];

    return Object.values(CalculatorPath).includes(routed)
      ? (routed as CalculatorPath)
      : CalculatorPath.EXPERT;
  }
}
