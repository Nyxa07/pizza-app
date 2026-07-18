import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, filter, map } from 'rxjs';

import { CalculatorStateShareComponent } from 'src/app/features/calculator/calculator-state-share/calculator-state-share.component';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
import { CalculatorService } from 'src/app/features/calculator/services/calculator.service';
import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
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
    IonTitle,
    IonContent,
    IonItem,
    IonSkeletonText,
    TranslatePipe,
    CalculatorStateShareComponent,
    MethodComponent,
  ],
})
export class CalculatorMethodPage implements OnInit {
  private readonly calculator = inject(CalculatorService);
  private readonly state = inject(CalculatorStateService);
  private readonly methodService = inject(MethodService);
  private readonly calculatorInitializer = inject(CalculatorInitializerService);

  private readonly methodStart = new Date();

  protected readonly isInitialized = signal(false);
  protected readonly method = toSignal(
    combineLatest([this.state.getInput$(), this.calculator.results$]).pipe(
      filter(([, output]) => output.total.flour > 0),
      map(([input, output]) =>
        this.methodService.build(input, output, this.methodStart),
      ),
    ),
    { initialValue: null },
  );

  ngOnInit() {
    idleCallback(() => {
      // Deep links land here cold: the Expert configuration is the
      // technical mode under the Method. The guard keeps the init of a
      // path the cook already opened.
      this.calculatorInitializer.initMethod();
      this.isInitialized.set(true);
    });
  }
}
