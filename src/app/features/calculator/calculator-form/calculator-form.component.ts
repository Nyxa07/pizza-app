import { Component, OnInit } from '@angular/core';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, LowerCasePipe } from '@angular/common';
import { combineLatest, debounceTime, filter, map, startWith } from 'rxjs';
import {
  CalculatorStateService,
  CalculatorInput,
} from '../services/calculator-state.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import { CalculatorSettingsService } from '../services/calculator-settings.service';
import { DoughType } from '../enums/dough-type.enum';
import { PizzaType } from '../../settings/enums/pizza-type.enum';

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
  private blockStatsUpdates = false;
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
    map((result) => result.pizzaBalls.prepTime),
  );

  protected totalRestTime$ = this.state.result$.pipe(
    map((result) => result.total.rtRestTime + result.total.coldRestTime),
  );

  protected totalPrepTime$ = this.state.result$.pipe(
    map((result) => result.total.prepTime),
  );

  protected pizzaTypes = Object.values(PizzaType).map((type) => ({
    value: type,
    label: `calculator.enums.pizzaTypes.${type}`,
  }));

  protected doughTypes = Object.values(DoughType).map((type) => ({
    value: type,
    label: `calculator.enums.doughTypes.${type}`,
  }));

  constructor(
    private formBuilder: FormBuilder,
    private settings: CalculatorSettingsService,
    private state: CalculatorStateService,
  ) {
    this.state.input$.pipe(takeUntilDestroyed()).subscribe((input) => {
      this.blockStatsUpdates = true;
      this.form.patchValue(input);
      setTimeout(() => {
        this.blockStatsUpdates = false;
      }, 100);
    });

    this.form.valueChanges
      .pipe(
        filter(() => !this.blockStatsUpdates),
        debounceTime(250),
        takeUntilDestroyed(),
      )
      .subscribe((v) => {
        this.state.update(v as CalculatorInput);
      });

    // // Set recommanded values for rtRestTime and coldRestTime based on doughType
    // // Even if not auto computed
    // this.form
    //   .get('doughType')!
    //   .valueChanges.pipe(takeUntilDestroyed())
    //   .subscribe((v) => {
    //     if (v === DoughType.POOLISH) {
    //       this.form.get('rtRestTime')!.setValue(1);
    //       this.form.get('coldRestTime')!.setValue(24);
    //     } else {
    //       this.form.get('rtRestTime')!.setValue(DEFAULT_INPUT.rtRestTime);
    //       this.form.get('coldRestTime')!.setValue(DEFAULT_INPUT.coldRestTime);
    //     }
    //   });

    // // Set recommanded value for oliveOilRatio based on pizzaType
    // this.form
    //   .get('pizzaType')!
    //   .valueChanges.pipe(takeUntilDestroyed(), distinctUntilChanged())
    //   .subscribe((v) => {
    //     if (v) {
    //       this.form
    //         .get('oliveOilRatio')!
    //         .setValue(DEFAULT_INPUTS[v].oliveOilRatio);
    //       this.form
    //         .get('hydrationRatio')!
    //         .setValue(DEFAULT_INPUTS[v].hydrationRatio);
    //     }
    //   });
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
