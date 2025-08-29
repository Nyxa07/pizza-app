import { Component, effect, OnInit, signal } from '@angular/core';
import { IonListHeader } from '@ionic/angular/standalone';
import { IonList } from '@ionic/angular/standalone';
import { IonItem } from '@ionic/angular/standalone';
import { IonToggle } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorStateService } from '../services/calculator-state.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, startWith, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import {
  AnvilIcon,
  CandyCaneIcon,
  CheckCheckIcon,
  HandFistIcon,
  LucideAngularModule,
  SpotlightIcon,
  BubblesIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-calculator-settings-form',
  templateUrl: './calculator-settings-form.component.html',
  styleUrls: ['./calculator-settings-form.component.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonToggle,
    TranslatePipe,
    ReactiveFormsModule,
    AsyncPipe,
    IonListHeader,
    LucideAngularModule,
  ],
})
export class CalculatorSettingsFormComponent implements OnInit {
  readonly AnvilIcon = AnvilIcon;
  readonly SpotlightIcon = SpotlightIcon;
  readonly CandyCaneIcon = CandyCaneIcon;
  readonly HandFistIcon = HandFistIcon;
  readonly CheckCheckIcon = CheckCheckIcon;
  readonly BubblesIcon = BubblesIcon;
  form = this.fb.group({
    pizzaWeightVisibility: [
      !this.calculatorState.getAutoCompute('pizzaWeight'),
    ],
    saltRatioVisibility: [!this.calculatorState.getAutoCompute('saltRatio')],
    honeyRatioVisibility: [!this.calculatorState.getAutoCompute('honeyRatio')],
    flourStrengthVisibility: [
      !this.calculatorState.getAutoCompute('flourStrength'),
    ],
    hydrationRatioVisibility: [
      !this.calculatorState.getAutoCompute('hydrationRatio'),
    ],
  });

  allVisibility$ = this.form.valueChanges.pipe(
    startWith(this.form.value),
    map(
      (value) =>
        value.pizzaWeightVisibility &&
        value.saltRatioVisibility &&
        value.honeyRatioVisibility &&
        value.flourStrengthVisibility,
    ),
  );

  constructor(
    private calculatorState: CalculatorStateService,
    private fb: FormBuilder,
  ) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value: any) => {
        this.calculatorState.updateAutoCompute({
          pizzaWeight: !value.pizzaWeightVisibility,
          saltRatio: !value.saltRatioVisibility,
          honeyRatio: !value.honeyRatioVisibility,
          flourStrength: !value.flourStrengthVisibility,
          hydrationRatio: !value.hydrationRatioVisibility,
        });
      });
  }

  onAllVisibilityChange(event: any) {
    this.form.patchValue({
      pizzaWeightVisibility: event.detail.checked,
      saltRatioVisibility: event.detail.checked,
      honeyRatioVisibility: event.detail.checked,
      flourStrengthVisibility: event.detail.checked,
      hydrationRatioVisibility: event.detail.checked,
    });
  }

  ngOnInit() {}
}
