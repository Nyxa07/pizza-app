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
import { LowerCasePipe } from '@angular/common';
import { debounceTime, first } from 'rxjs';
import { DoughType } from '../enums/dough-type.enum';
import {
  DoughFormStateService,
  DoughInput,
} from '../services/dough-form-state.service';
import { DEFAULT_INPUT } from '../services/dough-form-state.service';

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
  protected form = this.formBuilder.group<DoughInput>(DEFAULT_INPUT);

  constructor(
    private formBuilder: FormBuilder,
    private state: DoughFormStateService,
  ) {
    this.form
      .get('doughType')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value === DoughType.DIRECT) {
          this.form.get('poolishRatio')?.disable();
        } else {
          this.form.get('poolishRatio')?.enable();
        }
      });

    this.state.input$.pipe(first(), takeUntilDestroyed()).subscribe((v) => {
      this.form.patchValue(v);
    });

    this.form.valueChanges
      .pipe(debounceTime(50), takeUntilDestroyed())
      .subscribe((v) => {
        this.state.update(v as DoughInput);
      });
  }

  ngOnInit() {}

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
