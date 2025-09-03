import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  IonItem,
  IonList,
  IonListHeader,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from '@ionic/angular/standalone';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorStateService } from '../services/calculator-state.service';
import { CalculatorFormComponent } from '../calculator-form/calculator-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-planner-form',
  templateUrl: './planner-form.component.html',
  styleUrls: ['./planner-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonListHeader,
    IonList,
    IonItem,
    ReactiveFormsModule,
    TranslatePipe,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    CalculatorFormComponent,
  ],
})
export class PlannerFormComponent implements OnInit {
  protected form: FormGroup;
  protected storageKey = 'planner:form';

  private toLocalISOString(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, -1) + this.getTimezoneOffset(date);
  }

  private getTimezoneOffset(date: Date): string {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset) / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    return `${sign}${hours}:${minutes}`;
  }

  constructor(
    private formBuilder: FormBuilder,
    private state: CalculatorStateService,
    private prefStorage: PrefsStorage,
  ) {
    // this.form.get('preparationDate')?.valueChanges.subscribe((value) => {
    //   this.form
    //     .get('cookingDate')
    //     ?.setValue(
    //       this.toLocalISOString(
    //         new Date(new Date(value ?? '').getTime() + 6 * 60 * 60 * 1000),
    //       ),
    //       { emitEvent: false },
    //     );
    // });

    this.form = this.formBuilder.group({
      preparationDate: [
        this.toLocalISOString(new Date()),
        [Validators.required],
      ],
      cookingDate: [
        this.toLocalISOString(
          new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
        ),
        [Validators.required],
      ],
    });

    const values = this.prefStorage.get('planner:form');
    if (values) {
      this.form.patchValue(values);
    }

    this.form.valueChanges
      .pipe(
        debounceTime(300), // Debounce to avoid excessive calculations
        takeUntilDestroyed(),
      )
      .subscribe((value) => {
        // Cache date objects to avoid repeated parsing
        const prepDate = new Date(value.preparationDate ?? '');
        const cookDate = new Date(value.cookingDate ?? '');
        const prepTime = prepDate.getTime();
        const cookTime = cookDate.getTime();

        // Validate preparation date is before cooking date
        if (prepTime > cookTime) {
          this.form.get('cookingDate')?.setErrors({ invalid: true });
          return; // Early return to avoid further processing
        }

        // Validate cooking date is within 48 hours of preparation
        if (cookTime - prepTime > 48 * 3600 * 1000) {
          this.form.get('cookingDate')?.setErrors({ invalid: true });
          return; // Early return to avoid further processing
        }

        // Clear errors if validation passes
        this.form.get('cookingDate')?.setErrors(null);

        if (this.form.valid) {
          // Use cached values instead of re-parsing
          this.prefStorage.set(
            'planner:form',
            {
              preparationDate: value.preparationDate,
              cookingDate: value.cookingDate,
            },
            24 * 3600 * 1000, // 24 hours
          );

          this.state.update({
            preparationDate: prepTime,
            cookingDate: cookTime,
          });
        }
      });

    this.form.updateValueAndValidity();
  }

  ngOnInit() {}
}
