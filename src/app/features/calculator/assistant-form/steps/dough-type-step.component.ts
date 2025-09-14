import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DoughType } from '../../enums/dough-type.enum';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-dough-type-step',
  styles: [
    `
      .disabled {
        opacity: 0.5;
      }
    `,
  ],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{
          'calculator.assistant.form.doughType.subtitle' | translate
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ 'calculator.assistant.form.doughType.description' | translate }}
      </ion-card-content>
    </ion-card>

    <ion-list [formGroup]="parentGroup" lines="none">
      <ion-radio-group formControlName="doughType">
        @for (type of doughTypes; track type) {
          <ion-item
            button
            (click)="setDoughType(type)"
            [ngClass]="{
              disabled: type.disabled(),
            }"
          >
            <ion-radio
              [value]="type.value"
              slot="start"
              [disabled]="type.disabled()"
            ></ion-radio>
            <ion-label>
              <h3>{{ type.label | translate }}</h3>
              <p>{{ type.description | translate }}</p>
            </ion-label>
          </ion-item>
        }
      </ion-radio-group>
    </ion-list>
  `,
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonRadioGroup,
    IonRadio,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoughTypeStepComponent {
  @Input() parentGroup!: FormGroup;

  setDoughType(type: { value: DoughType; disabled: () => boolean }) {
    if (type.disabled()) {
      return;
    }
    this.parentGroup.get('doughType')?.setValue(type.value);
  }

  doughTypes = [
    {
      value: DoughType.DIRECT,
      label: 'calculator.enums.doughTypes.direct',
      description: 'calculator.assistant.form.doughType.helpers.direct',
      disabled: () => false,
    },
    {
      value: DoughType.POOLISH,
      label: 'calculator.enums.doughTypes.poolish',
      description: 'calculator.assistant.form.doughType.helpers.poolish',
      disabled: () => this.parentGroup.get('flourStrength')?.value < 270,
    },
  ];
}
