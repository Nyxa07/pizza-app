import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  IonItem,
  IonRange,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-temperature-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{
          'calculator.assistant.form.temperature.subtitle' | translate
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ 'calculator.assistant.form.temperature.description' | translate }}
      </ion-card-content>
    </ion-card>

    <ion-list [formGroup]="parentGroup" lines="none">
      <ion-item>
        <ion-range
          formControlName="temperature"
          [min]="15"
          [max]="35"
          [pin]="true"
          [snaps]="true"
          [step]="1"
          color="primary"
        >
          <ion-label slot="start">15</ion-label>
          <ion-label slot="end">35</ion-label>
        </ion-range>
      </ion-item>
    </ion-list>

    <ion-card>
      <ion-card-content class="ion-text-center">
        <h2>
          @if (parentGroup.get('temperature')?.value) {
            {{ parentGroup.get('temperature')?.value }}
            {{
              'calculator.assistant.form.temperature.temperature' | translate
            }}
          } @else {
            --
          }
        </h2>
      </ion-card-content>
    </ion-card>
  `,
  standalone: true,
  imports: [
    IonItem,
    IonRange,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    TranslatePipe,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemperatureStepComponent {
  @Input() parentGroup!: FormGroup;
}
