import { Component, inject, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { YeastType } from '../enums/yeast-type.enum';
import { POOLISH_RATIO_BY_TEMPERATURE } from '../constants';
import {
  IonItem,
  IonSelect,
  IonSelectOption,
  IonList,
  IonRange,
  IonInput,
  IonNote,
} from '@ionic/angular/standalone';
import { PoolishPizzaMakerService } from '../services/poolish-pizza-maker.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationKeys } from '../../../shared/services/translation-keys.service';
import { LowerCasePipe } from '@angular/common';

export interface PoolishPizzaFormData {
  nbPizzas: number;
  yeastType: YeastType;
  hydrationRatio: number;
  temperature: number;
  poolishRatio: number;
  rtRestTime: number;
  coldRestTime: number;
}

@Component({
  selector: 'app-poolish-pizzas-form',
  templateUrl: './poolish-pizzas-form.component.html',
  styleUrls: ['./poolish-pizzas-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonList,
    IonRange,
    TranslateModule,
    LowerCasePipe,
  ],
  standalone: true,
})
export class PoolishPizzasFormComponent implements OnInit {
  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;

  protected poolishRatioOptions = [
    {
      name: 'Auto',
      value: 0,
    },
    ...[...new Set(Object.values(POOLISH_RATIO_BY_TEMPERATURE))].map(
      (value) => ({
        name: `${Math.round(value * 100)}%`,
        value: value,
      }),
    ),
  ];

  protected temperatureOptions = Object.keys(POOLISH_RATIO_BY_TEMPERATURE).map(
    (key) => ({
      name: `${key}°C`,
      value: Number(key),
    }),
  );
  protected formBuilder = inject(FormBuilder);
  protected form = this.formBuilder.group({
    nbPizzas: [5, [Validators.required, Validators.min(1)]],
    yeastType: [YeastType.DRY_ACTIVE, [Validators.required]],
    hydrationRatio: [
      0.62,
      [Validators.required, Validators.min(0), Validators.max(1)],
    ],
    temperature: [
      20,
      [Validators.required, Validators.min(0), Validators.max(30)],
    ],
    poolishRatio: [
      0,
      [Validators.required, Validators.min(0), Validators.max(1)],
    ],
    rtRestTime: [
      1,
      [Validators.required, Validators.min(1), Validators.max(24)],
    ],
    coldRestTime: [
      16,
      [Validators.required, Validators.min(0), Validators.max(72)],
    ],
  });

  protected makePizzaService = inject(PoolishPizzaMakerService);
  protected onChange = output<PoolishPizzaFormData>();

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (this.form.invalid) {
        return;
      }
      this.onChange.emit(value as PoolishPizzaFormData);
    });
  }

  ngOnInit() {
    this.onChange.emit(this.form.value as PoolishPizzaFormData);
  }

  protected pinFormatter(value: number) {
    return `${value}`;
  }

  protected pinHoursFormatter(value: number) {
    return `${value}`;
  }

  protected range(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
