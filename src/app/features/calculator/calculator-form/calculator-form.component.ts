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
import { AsyncPipe, JsonPipe, LowerCasePipe } from '@angular/common';
import { debounceTime, map, tap } from 'rxjs';
import {
  CalculatorStateService,
  CalculatorInput,
} from '../services/calculator-state.service';
import { DEFAULT_INPUT } from '../services/calculator-state.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

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
  protected visibility$ = this.state.autoCompute$.pipe(
    takeUntilDestroyed(),
    map((v) => {
      return Object.keys(v).reduce(
        (acc, k) => {
          acc[k as keyof typeof v] = !v[k as keyof typeof v];
          return acc;
        },
        {} as Record<keyof typeof v, boolean>,
      );
    }),
  );

  constructor(
    private formBuilder: FormBuilder,
    private state: CalculatorStateService,
  ) {
    this.state.input$.pipe(takeUntilDestroyed()).subscribe((v) => {
      this.form.patchValue(v, { emitEvent: false });
    });

    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed())
      .subscribe((v) => {
        this.state.update(v as CalculatorInput);
      });
  }

  ngOnInit() {}

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
