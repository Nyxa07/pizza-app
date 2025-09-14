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
  selector: 'app-quantity-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{
          'calculator.assistant.form.quantity.subtitle' | translate
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ 'calculator.assistant.form.quantity.description' | translate }}
      </ion-card-content>
    </ion-card>

    <ion-list [formGroup]="parentGroup" lines="none">
      <ion-item>
        <ion-range
          formControlName="nbPizzas"
          [min]="1"
          [max]="20"
          [pin]="true"
          [snaps]="true"
          [step]="1"
          color="primary"
        >
          <ion-label slot="start">1</ion-label>
          <ion-label slot="end">20</ion-label>
        </ion-range>
      </ion-item>
    </ion-list>

    <ion-card>
      <ion-card-content class="ion-text-center">
        <h2>
          @if (parentGroup.get('nbPizzas')?.value) {
            {{ parentGroup.get('nbPizzas')?.value }}
            {{ 'calculator.assistant.form.quantity.pizzas' | translate }}
          } @else {
            <h2>--</h2>
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
export class QuantityStepComponent {
  @Input() parentGroup!: FormGroup;
}
