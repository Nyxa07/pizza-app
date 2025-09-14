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
import { YeastType } from '../../enums/yeast-type.enum';

@Component({
  selector: 'app-yeast-type-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{
          'calculator.assistant.form.yeastType.subtitle' | translate
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ 'calculator.assistant.form.yeastType.description' | translate }}
      </ion-card-content>
    </ion-card>

    <ion-list [formGroup]="parentGroup" lines="none">
      <ion-radio-group formControlName="yeastType">
        @for (type of doughTypes; track type) {
          <ion-item
            button
            (click)="parentGroup.get('yeastType')?.setValue(type.value)"
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
export class YeastTypeStepComponent {
  @Input() parentGroup!: FormGroup;

  doughTypes = [
    {
      value: YeastType.DRY_ACTIVE,
      label: 'calculator.enums.yeastTypes.dryActive',
      description: 'calculator.assistant.form.yeastType.helpers.dryActive',
    },
    {
      value: YeastType.DRY_INSTANT,
      label: 'calculator.enums.yeastTypes.dryInstant',
      description: 'calculator.assistant.form.yeastType.helpers.dryInstant',
    },
    {
      value: YeastType.FRESH,
      label: 'calculator.enums.yeastTypes.fresh',
      description: 'calculator.assistant.form.yeastType.helpers.fresh',
    },
  ];
}
