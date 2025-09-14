import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
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
  IonRange,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dough-type-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{
          'calculator.assistant.form.flourType.subtitle' | translate
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ 'calculator.assistant.form.flourType.description' | translate }}
      </ion-card-content>
    </ion-card>

    <ion-list lines="none" [formGroup]="parentGroup">
      <ion-radio-group formControlName="flourStrenghKnowledge">
        <ion-item button (click)="setKnowledge(false)">
          <ion-radio [value]="false" slot="start"></ion-radio>
          <ion-label>
            <h3>
              {{ 'calculator.assistant.form.flourType.helpers.no' | translate }}
            </h3>
          </ion-label>
        </ion-item>
        <ion-item button (click)="setKnowledge(true)">
          <ion-radio [value]="true" slot="start"></ion-radio>
          <ion-label>
            <h3>
              {{
                'calculator.assistant.form.flourType.helpers.yes' | translate
              }}
            </h3>
          </ion-label>
        </ion-item>
      </ion-radio-group>
    </ion-list>

    @if (parentGroup.get('flourStrenghKnowledge')?.value !== null) {
      <ion-list [formGroup]="parentGroup" lines="none">
        @if (parentGroup.get('flourStrenghKnowledge')?.value === true) {
          <ion-item>
            <ion-range
              formControlName="flourStrength"
              [min]="150"
              [max]="400"
              [pin]="true"
              [snaps]="true"
              [step]="10"
              color="primary"
            >
              <ion-label slot="start">150</ion-label>
              <ion-label slot="end">400</ion-label>
            </ion-range>
          </ion-item>
        } @else if (parentGroup.get('flourStrenghKnowledge')?.value === false) {
          <ion-radio-group formControlName="flourStrength">
            <ion-item
              button
              (click)="parentGroup.get('flourStrength')?.setValue(180)"
            >
              <ion-radio [value]="180" slot="start"></ion-radio>
              <ion-label>
                <h3>
                  {{
                    'calculator.assistant.form.flourType.helpers.standard'
                      | translate
                  }}
                </h3>
              </ion-label>
            </ion-item>
            <ion-item
              button
              (click)="parentGroup.get('flourStrength')?.setValue(270)"
            >
              <ion-radio [value]="270" slot="start"></ion-radio>
              <ion-label>
                <h3>
                  {{
                    'calculator.assistant.form.flourType.helpers.specialPizza'
                      | translate
                  }}
                </h3>
              </ion-label>
            </ion-item>
          </ion-radio-group>
        }
      </ion-list>
      <ion-card>
        <ion-card-content class="ion-text-center">
          <h2>
            @if (parentGroup.get('flourStrength')?.value) {
              {{
                'calculator.assistant.form.flourType.helpers.strength'
                  | translate
              }}
              :
              {{ parentGroup.get('flourStrength')?.value }}
            } @else {
              <h2>--</h2>
            }
          </h2>
        </ion-card-content>
      </ion-card>
    }
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
    IonRange,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlourTypeStepComponent implements OnInit {
  @Input() parentGroup!: FormGroup;

  ngOnInit(): void {}

  setKnowledge(value: boolean) {
    this.parentGroup.get('flourStrenghKnowledge')?.setValue(value);
  }
}
