import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { DoughType } from 'src/app/features/calculator/enums/dough-type.enum';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
import { CALCULATOR_MODE } from 'src/app/features/calculator/services/calculator-settings.service';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonBackButton,
  IonItem,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { AssistantFormComponent } from 'src/app/features/calculator/assistant-form/assistant-form.component';

@Component({
  selector: 'calculator-assistant-page',
  templateUrl: './assistant.page.html',
  styleUrls: ['./assistant.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonBackButton,
    TranslatePipe,
    AssistantFormComponent,
    IonItem,
    IonSkeletonText,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorAssistantPage implements OnInit {
  protected isInitialized = signal(false);

  constructor(private calculatorInitializer: CalculatorInitializerService) {}

  ngOnInit() {
    idleCallback(() => {
      this.calculatorInitializer.init(CALCULATOR_MODE.ASSIST, {
        settings: {
          saltRatio: { auto: true, visible: false },
          honeyRatio: { auto: true, visible: false },
          flourStrength: { auto: false, visible: true },
          hydrationRatio: { auto: true, visible: false },
          doughType: { auto: false, visible: true },
          poolishRatio: { auto: true, visible: false },
          yeastType: { auto: false, visible: true },
          coldRestTime: { auto: true, visible: false },
          rtRestTime: { auto: true, visible: false },
          globalRestTime: { auto: false, visible: true },
          pizzaWeight: { auto: true, visible: false },
          oliveOilRatio: { auto: true, visible: false },
        },
      });
      this.isInitialized.set(true);
    });
  }
}
