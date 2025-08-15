import { Component, inject, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { YeastType } from '../enums/yeast-type.enum';
import {
  IonItem,
  IonSelect,
  IonSelectOption,
  IonList,
  IonRange,
} from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationKeys } from '../../../shared/services/translation-keys.service';
import { LowerCasePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DoughType } from '../enums/dough-type.enum';
import { DoughCalculatorService } from '../services/dough-calculator.service';

export interface PoolishPizzaFormData {
  nbPizzas: number;
  doughType: DoughType;
  yeastType: YeastType;
  hydrationRatio: number;
  temperature: number;
  poolishRatio?: number;
  rtRestTime: number;
  coldRestTime: number;
}

@Component({
  selector: 'app-dough-form',
  templateUrl: './dough-form.component.html',
  styleUrls: ['./dough-form.component.scss'],
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
export class DoughFormComponent implements OnInit {
  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;
  protected storedData = localStorage.getItem('PoolishPizzaForm:formData');
  protected formBuilder = inject(FormBuilder);
  protected form = this.formBuilder.group({
    nbPizzas: [5, [Validators.required, Validators.min(1)]],
    doughType: [DoughType.DIRECT, [Validators.required]],
    yeastType: [YeastType.DRY_ACTIVE, [Validators.required]],
    hydrationRatio: [
      0.62,
      [Validators.required, Validators.min(0), Validators.max(1)],
    ],
    temperature: [
      20,
      [Validators.required, Validators.min(0), Validators.max(36)],
    ],
    poolishRatio: [
      0.3,
      [Validators.required, Validators.min(0), Validators.max(0.6)],
    ],
    rtRestTime: [
      1,
      [Validators.required, Validators.min(1), Validators.max(24)],
    ],
    coldRestTime: [
      16,
      [Validators.required, Validators.min(0), Validators.max(24)],
    ],
  });

  protected doughCalculatorService = inject(DoughCalculatorService);
  protected onChange = output<PoolishPizzaFormData>();

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(250))
      .subscribe((value) => {
        if (this.form.invalid) {
          return;
        }
        localStorage.setItem(
          'PoolishPizzaForm:formData',
          JSON.stringify(value),
        );
        this.onChange.emit(value as PoolishPizzaFormData);
      });

    this.form
      .get('doughType')
      ?.valueChanges.pipe(
        debounceTime(150),
        takeUntilDestroyed(),
        distinctUntilChanged(),
      )
      .subscribe((value) => {
        if (value === DoughType.DIRECT) {
          this.form.get('poolishRatio')?.disable();
        } else {
          this.form.get('poolishRatio')?.enable();
        }
      });

    this.form.patchValue(
      this.storedData ? JSON.parse(this.storedData) : this.form.value,
    );
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
