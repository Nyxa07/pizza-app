import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  IonItem,
  IonSelect,
  IonSelectOption,
  IonList,
  IonRange,
  IonListHeader,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, LowerCasePipe } from '@angular/common';
import { debounceTime } from 'rxjs';
import {
  CalculatorStateService,
  CalculatorInput,
} from '../services/calculator-state.service';
import { DEFAULT_INPUT } from '../services/calculator-state.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import {
  HydrationRange,
  HydrationService,
} from '../services/hydration.service';

@Component({
  selector: 'app-calculator-form',
  templateUrl: './calculator-form.component.html',
  styleUrls: ['./calculator-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonList,
    IonRange,
    TranslateModule,
    LowerCasePipe,
    AsyncPipe,
    NumberPipe,
    IonListHeader,
    IonLabel,
  ],
  standalone: true,
})
export class CalculatorFormComponent implements OnInit {
  protected form = this.formBuilder.group<CalculatorInput>(DEFAULT_INPUT);
  protected visibility$ = this.state.visibility$;
  protected recommendedHydration = signal<HydrationRange>({
    minHydration: 0,
    maxHydration: 0,
  });

  constructor(
    private formBuilder: FormBuilder,
    private state: CalculatorStateService,
    private hydrationService: HydrationService,
  ) {
    this.state.input$.pipe(takeUntilDestroyed()).subscribe((v) => {
      this.form.patchValue(v, { emitEvent: false });
      this.updateRecommendedHydration(v.flourStrength ?? 0);
    });

    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed())
      .subscribe((v) => {
        this.state.update(v as CalculatorInput);
      });

    this.form
      .get('flourStrength')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((v) => {
        this.updateRecommendedHydration(v ?? 0);
      });
  }

  ngOnInit() {}

  private updateRecommendedHydration(flourStrength: number) {
    const res = this.hydrationService.compute(flourStrength);
    res.minHydration = Math.round(res.minHydration * 100);
    res.maxHydration = Math.round(res.maxHydration * 100);
    this.recommendedHydration.set(res);
  }

  protected pinFormatter(value: number) {
    return `${value}`;
  }

  protected range(
    start: number,
    end: number,
    step: number = 1,
    decimal: number = 0,
  ) {
    return Array.from(
      { length: (end - start) / step + 1 },
      (_, i) => Math.round((start + i * step) * 10 ** decimal) / 10 ** decimal,
    );
  }
}
