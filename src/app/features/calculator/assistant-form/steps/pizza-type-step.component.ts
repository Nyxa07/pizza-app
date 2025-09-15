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
import { PizzaType } from '../../../settings/enums/pizza-type.enum';

@Component({
  selector: 'app-pizza-type-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{
          'calculator.assistant.form.pizzaType.subtitle' | translate
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ 'calculator.assistant.form.pizzaType.description' | translate }}
      </ion-card-content>
    </ion-card>

    <ion-list [formGroup]="parentGroup" lines="none">
      <ion-radio-group formControlName="pizzaType">
        @for (type of pizzaTypes; track type) {
          <ion-item
            button
            (click)="parentGroup.get('pizzaType')?.setValue(type.value)"
          >
            <ion-radio [value]="type.value" slot="start"></ion-radio>
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzaTypeStepComponent {
  @Input() parentGroup!: FormGroup;
  pizzaTypes = [
    {
      value: PizzaType.NEAPOLITAN,
      label: 'calculator.enums.pizzaTypes.neapolitan',
      description: 'calculator.assistant.form.pizzaType.helpers.neapolitan',
    },
    {
      value: PizzaType.ROMAN,
      label: 'calculator.enums.pizzaTypes.roman',
      description: 'calculator.assistant.form.pizzaType.helpers.roman',
    },
  ];
}
