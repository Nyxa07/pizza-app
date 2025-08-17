import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { YeastType } from '../enums/yeast-type.enum';
import {
  IonItem,
  IonSelect,
  IonSelectOption,
  IonList,
  IonRange,
  IonButton,
} from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, LowerCasePipe } from '@angular/common';
import { debounceTime, first, map, Observable, startWith, tap } from 'rxjs';
import {
  DoughFormStateService,
  DoughInput,
} from '../services/dough-form-state.service';
import { DEFAULT_INPUT } from '../services/dough-form-state.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import {
  HydrationRange,
  HydrationService,
} from '../services/hydration.service';

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
    AsyncPipe,
    NumberPipe,
    IonButton,
  ],
  standalone: true,
})
export class DoughFormComponent implements OnInit {
  protected form = this.formBuilder.group<DoughInput>(DEFAULT_INPUT);
  protected visibility$ = this.state.visibility$;
  protected recommendedHydration = signal<HydrationRange>({
    minHydration: 0,
    maxHydration: 0,
  });

  constructor(
    private formBuilder: FormBuilder,
    private state: DoughFormStateService,
    private hydrationService: HydrationService,
  ) {
    this.state.input$.pipe(first(), takeUntilDestroyed()).subscribe((v) => {
      this.form.patchValue(v);
      this.updateRecommendedHydration(v.flourStrength ?? 0);
    });

    this.form.valueChanges
      .pipe(debounceTime(50), takeUntilDestroyed())
      .subscribe((v) => {
        this.state.update(v as DoughInput);
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

  protected reset() {
    this.form.patchValue(DEFAULT_INPUT);
    console.log('reset', DEFAULT_INPUT, this.form.value);
  }
}
