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
import { CalculatorStateService } from '../services/calculator-state.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import { range } from 'src/app/shared/helpers/range';
import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from 'src/app/features/sheets/info-sheet-button/info-sheet-button.component';
import { CalculatorSettingsService } from '../services/calculator-settings.service';
import { DoughType } from '../enums/dough-type.enum';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CalculatorService } from '../services/calculator.service';

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
    InfoSheetButtonComponent,
  ],
  standalone: true,
})
export class CalculatorFormComponent implements OnInit {
  private blockStatsUpdates = false;
  protected form = this.formBuilder.group<ICalculatorInput>(
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

  // The ⓘ on the method field opens the Fiche of the selected method;
  // its sibling methods stay one « Voir aussi » tap away (issue #70).
  protected methodSheetId$ = this.doughType$.pipe(
    map((doughType) =>
      doughType === DoughType.POOLISH
        ? InfoSheetId.POOLISH
        : InfoSheetId.DIRECT,
    ),
  );

  protected pizzaBallsRestTime$ = this.calculator.results$.pipe(
    map((result) => result.pizzaBalls.prepTime),
  );

  protected totalRestTime$ = this.calculator.results$.pipe(
    map((result) => result.total.rtRestTime + result.total.coldRestTime),
  );

  protected totalPrepTime$ = this.calculator.results$.pipe(
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
    private calculator: CalculatorService,
  ) {
    this.state
      .getInput$()
      .pipe(takeUntilDestroyed())
      .subscribe((input) => {
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
        this.state.update(v as ICalculatorInput);
      });
  }

  ngOnInit() {
    this.settings$ = this.settings.getSettings$();
  }

  protected pinFormatter(value: number) {
    return `${value}`;
  }

  protected readonly range = range;
  protected readonly InfoSheetId = InfoSheetId;
}
