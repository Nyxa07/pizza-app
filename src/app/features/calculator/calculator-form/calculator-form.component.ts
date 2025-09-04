import { Component, computed, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  IonItem,
  IonSelect,
  IonSelectOption,
  IonList,
  IonRange,
  IonListHeader,
  IonLabel,
} from '@ionic/angular/standalone';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, JsonPipe, LowerCasePipe } from '@angular/common';
import { combineLatest, debounceTime, map, startWith } from 'rxjs';
import {
  CalculatorStateService,
  CalculatorInput,
} from '../services/calculator-state.service';
import { DEFAULT_INPUT } from '../services/calculator-state.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import { CalculatorSettingsService } from '../services/calculator-settings.service';
import { DoughType } from '../enums/dough-type.enum';

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
  protected form = this.formBuilder.group<CalculatorInput>(
    this.state.getInput(),
  );
  protected doughType$ = this.form
    .get('doughType')!
    .valueChanges.pipe(startWith(this.form.get('doughType')!.value));

  protected settings$ = this.settings
    .getSettings$()
    .pipe(startWith(this.settings.getSettings()));

  protected showPoolishRatio$ = combineLatest([
    this.doughType$,
    this.settings$,
  ]).pipe(
    takeUntilDestroyed(),
    map(
      ([doughType, settings]) =>
        doughType === DoughType.POOLISH && settings.poolishRatio.visible,
    ),
  );

  protected pizzaBallsRestTime$ = this.state.result$.pipe(
    map((result) => result.pizzaBalls.rtRestTime),
  );

  protected doughAndPoolishRestTime$ = this.state.result$.pipe(
    map(
      (result) =>
        (result.poolish
          ? result.poolish.rtRestTime + result.poolish.coldRestTime
          : result.dough.rtRestTime + result.dough.coldRestTime) +
        (result.total.coldRestTime > 0 ? 1 : 0),
    ),
  );

  protected totalPrepTime$ = this.state.result$.pipe(
    map(
      (result) =>
        result.total.rtRestTime +
        result.total.coldRestTime +
        1 +
        (result.total.coldRestTime > 0 ? 1 : 0),
    ),
  );

  constructor(
    private formBuilder: FormBuilder,
    private settings: CalculatorSettingsService,
    private state: CalculatorStateService,
  ) {
    this.state.input$.pipe(takeUntilDestroyed()).subscribe((input) => {
      this.form.patchValue(input, { emitEvent: false });
    });
    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed())
      .subscribe((v) => {
        this.state.update(v as CalculatorInput);
      });

    // Set recommanded values for rtRestTime and coldRestTime based on doughType
    // Even if not auto computed
    this.form
      .get('doughType')!
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe((v) => {
        if (v === DoughType.POOLISH) {
          this.form.get('rtRestTime')!.setValue(1);
          this.form.get('coldRestTime')!.setValue(24);
        } else {
          this.form.get('rtRestTime')!.setValue(DEFAULT_INPUT.rtRestTime);
          this.form.get('coldRestTime')!.setValue(DEFAULT_INPUT.coldRestTime);
        }
      });
  }

  ngOnInit() {
    this.settings$ = this.settings.getSettings$();
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
