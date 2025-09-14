import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { PizzaType } from '../../../settings/enums/pizza-type.enum';
import { DoughType } from '../../enums/dough-type.enum';
import {
  PizzaIcon,
  WheatIcon,
  CheckIcon,
  ChartColumnBigIcon,
  ThermometerIcon,
  TorusIcon,
  LucideAngularModule,
  ThermometerSunIcon,
  ThermometerSnowflakeIcon,
} from 'lucide-angular';
import { FormGroup } from '@angular/forms';
import { YeastType } from '../../enums/yeast-type.enum';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-summary-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{
          'calculator.assistant.form.summary.subtitle' | translate
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ 'calculator.assistant.form.summary.description' | translate }}
      </ion-card-content>
    </ion-card>

    <ion-list>
      <ion-item>
        <i-lucide [img]="PizzaIcon" slot="start"></i-lucide>
        <ion-label>
          {{ 'calculator.assistant.form.titles.pizzaType' | translate }}
          <p>{{ getPizzaTypeLabel() | translate }}</p>
        </ion-label>
      </ion-item>

      <ion-item>
        <i-lucide [img]="WheatIcon" slot="start"></i-lucide>
        <ion-label>
          {{ 'calculator.assistant.form.titles.doughType' | translate }}
          <p>{{ getDoughTypeLabel() | translate }}</p>
        </ion-label>
      </ion-item>

      <ion-item>
        <i-lucide [img]="ChartColumnBigIcon" slot="start"></i-lucide>
        <ion-label>
          {{ 'calculator.assistant.form.titles.quantity' | translate }}
          <p>
            {{ assistantData.nbPizzas }}
            {{ 'calculator.assistant.form.quantity.pizzas' | translate }}
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <i-lucide [img]="ThermometerIcon" slot="start"></i-lucide>
        <ion-label>
          {{ 'calculator.assistant.form.titles.temperature' | translate }}
          <p>{{ assistantData.temperature }}°C</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <i-lucide [img]="TorusIcon" slot="start"></i-lucide>
        <ion-label>
          {{ 'calculator.assistant.form.titles.yeastType' | translate }}
          <p>{{ getYeastTypeLabel() | translate }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <i-lucide [img]="ThermometerSunIcon" slot="start"></i-lucide>
        <ion-label>
          {{ 'calculator.assistant.form.titles.rtRestTime' | translate }}
          <p>
            {{ assistantData.rtRestTime }}
            {{
              'common.time.hours'
                | translate: { count: assistantData.rtRestTime }
            }}
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <i-lucide [img]="ThermometerSnowflakeIcon" slot="start"></i-lucide>
        <ion-label>
          {{ 'calculator.assistant.form.titles.coldRestTime' | translate }}
          <p>
            {{ assistantData.coldRestTime }}
            {{
              'common.time.hours'
                | translate: { count: assistantData.coldRestTime }
            }}
          </p>
        </ion-label>
      </ion-item>
    </ion-list>

    <ion-card color="success">
      <ion-card-content class="ion-text-center">
        <i-lucide [img]="CheckIcon" slot="start"></i-lucide>
        <h3>{{ 'calculator.assistant.form.summary.ready' | translate }}</h3>
        <p>
          {{ 'calculator.assistant.form.summary.readyDescription' | translate }}
        </p>
      </ion-card-content>
    </ion-card>
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
    LucideAngularModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryStepComponent {
  PizzaIcon = PizzaIcon;
  WheatIcon = WheatIcon;
  ChartColumnBigIcon = ChartColumnBigIcon;
  CheckIcon = CheckIcon;
  ThermometerIcon = ThermometerIcon;
  TorusIcon = TorusIcon;
  ThermometerSunIcon = ThermometerSunIcon;
  ThermometerSnowflakeIcon = ThermometerSnowflakeIcon;
  @Input() parentGroup!: FormGroup;

  get assistantData() {
    return this.parentGroup.value;
  }

  getPizzaTypeLabel(): string {
    switch (this.assistantData.pizzaType) {
      case PizzaType.NEAPOLITAN:
        return 'calculator.enums.pizzaTypes.neapolitan';
      case PizzaType.ROMAN:
        return 'calculator.enums.pizzaTypes.roman';
      default:
        return '';
    }
  }

  getDoughTypeLabel(): string {
    switch (this.assistantData.doughType) {
      case DoughType.DIRECT:
        return 'calculator.enums.doughTypes.direct';
      case DoughType.POOLISH:
        return 'calculator.enums.doughTypes.poolish';
      default:
        return '';
    }
  }

  getYeastTypeLabel(): string {
    switch (this.assistantData.yeastType) {
      case YeastType.DRY_ACTIVE:
        return 'calculator.enums.yeastTypes.dryActive';
      case YeastType.DRY_INSTANT:
        return 'calculator.enums.yeastTypes.dryInstant';
      case YeastType.FRESH:
        return 'calculator.enums.yeastTypes.fresh';
      default:
        return '';
    }
  }
}
