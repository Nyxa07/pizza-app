import { Component, OnInit } from '@angular/core';
import {
  IonItem,
  IonList,
  IonListHeader,
  IonRange,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonLabel,
  IonInput,
} from '@ionic/angular/standalone';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorInput } from '../services/calculator-state.service';
import { CalculatorFormComponent } from '../calculator-form/calculator-form.component';

@Component({
  selector: 'app-planner-form',
  templateUrl: './planner-form.component.html',
  styleUrls: ['./planner-form.component.scss'],
  standalone: true,
  imports: [
    IonListHeader,
    IonList,
    IonItem,
    ReactiveFormsModule,
    TranslatePipe,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonLabel,
    IonInput,
    CalculatorFormComponent,
  ],
})
export class PlannerFormComponent implements OnInit {
  protected form = this.formBuilder.group({
    preparationDate: [this.toLocalISOString(new Date()), [Validators.required]],
    cookingDate: [
      this.toLocalISOString(
        new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
      ),
      [Validators.required],
    ],
  });

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

  constructor(private formBuilder: FormBuilder) {
    this.form
      .get('preparationDate')
      ?.valueChanges.subscribe((value: string | null) => {
        if (value) {
          this.form
            .get('cookingDate')
            ?.setValue(
              this.toLocalISOString(
                new Date(new Date(value).getTime() + 4 * 60 * 60 * 1000),
              ),
            );
        }
      });
  }

  ngOnInit() {}
}
