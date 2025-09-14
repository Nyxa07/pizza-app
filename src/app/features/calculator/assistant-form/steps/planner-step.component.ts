import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import {
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRadioGroup,
  IonRadio,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DoughType } from '../../enums/dough-type.enum';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

@Component({
  selector: 'app-dough-type-step',
  template: `
    @let result = result$ | async;
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{
          'calculator.assistant.form.planner.subtitle' | translate
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ 'calculator.assistant.form.planner.description' | translate }}
      </ion-card-content>
    </ion-card>

    <ion-list [formGroup]="parentGroup" lines="none">
      <ion-radio-group formControlName="hasLongRestTime">
        @if (showLongRestOption()) {
          <ion-item button (click)="setHasLongRestTime(true)">
            <ion-radio [value]="true" slot="start"></ion-radio>
            <ion-label>
              <h3>
                {{
                  'calculator.assistant.form.planner.withLongRestTime'
                    | translate
                }}
              </h3>
              <p>
                {{
                  'calculator.assistant.form.planner.withLongRestTimeDescription'
                    | translate
                }}
              </p>
            </ion-label>
          </ion-item>
        }
        <ion-item button (click)="setHasLongRestTime(false)">
          <ion-radio [value]="false" slot="start"></ion-radio>
          <ion-label>
            <h3>
              {{
                'calculator.assistant.form.planner.withoutLongRestTime'
                  | translate
              }}
            </h3>
            <p>
              {{
                'calculator.assistant.form.planner.withoutLongRestTimeDescription'
                  | translate
              }}
            </p>
          </ion-label>
        </ion-item>
      </ion-radio-group>
    </ion-list>

    @if (parentGroup.get('hasLongRestTime')?.value === false) {
      <ion-list lines="none" [formGroup]="parentGroup">
        <ion-radio-group formControlName="restTime">
          @for (i of shortRestTimes; track i) {
            <ion-item button (click)="parentGroup.get('restTime')?.setValue(i)">
              <ion-radio [value]="i" slot="start"></ion-radio>
              <ion-label>
                {{ i }} {{ 'common.time.hours' | translate: { count: i } }}
              </ion-label>
            </ion-item>
          }
        </ion-radio-group>
      </ion-list>
    }
    @if (parentGroup.get('hasLongRestTime')?.value === true) {
      <ion-list lines="none" [formGroup]="parentGroup">
        <ion-radio-group formControlName="restTime">
          @for (i of longRestTimes; track i) {
            <ion-item button (click)="parentGroup.get('restTime')?.setValue(i)">
              <ion-radio [value]="i" slot="start"></ion-radio>
              <ion-label>
                {{ i }}
                {{ 'common.time.hours' | translate: { count: i } }}
              </ion-label>
            </ion-item>
          }
        </ion-radio-group>
      </ion-list>
    }

    @if (parentGroup.get('restTime')?.value) {
      <ion-card>
        <ion-card-content class="ion-text-center">
          <h2>
            {{ 'calculator.assistant.form.planner.totalPrepTime' | translate }}
            :
          </h2>
          <h2
            [style.marginTop]="'.5rem'"
            [style.marginBottom]="'.5rem'"
            [style.fontSize]="'1.5rem'"
            [style.fontWeight]="'bold'"
            [style.color]="'var(--ion-color-secondary)'"
          >
            {{ result?.total?.prepTime | number: '1.0-0' }}
            {{
              'common.time.hours'
                | translate: { count: result?.total?.prepTime }
            }}
          </h2>
          <p>
            {{
              'calculator.assistant.form.planner.totalPrepTimeDescription'
                | translate
            }}
          </p>
        </ion-card-content>
      </ion-card>
    }
  `,
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    TranslatePipe,
    ReactiveFormsModule,
    IonRadioGroup,
    IonRadio,
    AsyncPipe,
    NumberPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerStepComponent implements OnInit {
  state = inject(CalculatorStateService);
  result$ = this.state.result$;
  @Input() parentGroup!: FormGroup;

  showLongRestOption = signal(false);
  shortRestTimes = [2, 4, 6, 8, 12];
  longRestTimes = [16, 24, 48];

  setHasLongRestTime(value: boolean | null) {
    // if (value !== this.parentGroup.get('hasLongRestTime')?.value) {
    //   this.parentGroup.get('restTime')?.setValue(null);
    // }
    this.parentGroup.get('hasLongRestTime')?.setValue(value);
  }

  ngOnInit(): void {
    this.showLongRestOption.set(
      this.parentGroup.get('flourStrength')?.value >= 270,
    );

    if (!this.showLongRestOption()) {
      this.setHasLongRestTime(false);
    }
  }
}
