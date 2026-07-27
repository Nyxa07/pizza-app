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
import { map, Observable } from 'rxjs';

import { CalculatorStateShareComponent } from 'src/app/features/calculator/calculator-state-share/calculator-state-share.component';
import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import { CalculatorMethods } from 'src/app/features/calculator/method/calculator-methods.service';
import { CalculatorPaths } from 'src/app/features/calculator/paths/calculator-paths.service';
import { DoughSaverComponent } from 'src/app/features/doughs/dough-saver/dough-saver.component';
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
  private readonly methods = inject(CalculatorMethods);
  private readonly paths = inject(CalculatorPaths);

  private readonly path = this.readPath();
  // The path is only known at runtime, so the module hands back controls the
  // screen can drive but not edit — which is all a Method ever needs.
  private readonly input$: Observable<ICalculatorInput> = this.paths
    .for(this.path)
    .resolvedInput$();

  protected readonly ChefHatIcon = ChefHatIcon;
  protected readonly backHref = `/tabs/calculator/${this.path}`;
  protected readonly isInitialized = signal(false);
  /** The resolved input of the current path, saved as-is by the Dough saver. */
  protected readonly currentInput = toSignal(this.input$, {
    initialValue: null,
  });
  /** `null` while the Draft holds nothing to narrate — the empty state. */
  protected readonly method = toSignal(
    this.input$.pipe(map((input) => this.methods.methodFor(input))),
    { initialValue: null },
  );

  ngOnInit() {
    idleCallback(() => this.isInitialized.set(true));
  }

  /** Unrouted or unknown Method links land on Expert, as they always have. */
  private readPath(): CalculatorPath {
    const routed = this.route.snapshot.data['calculatorPath'];

    return Object.values(CalculatorPath).includes(routed)
      ? (routed as CalculatorPath)
      : CalculatorPath.EXPERT;
  }
}
