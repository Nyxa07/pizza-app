import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
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
    IonItem,
    IonSkeletonText,
    AssistantFormComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorAssistantPage implements OnInit {
  protected isInitialized = signal(false);

  constructor(private calculatorInitializer: CalculatorInitializerService) {}

  ngOnInit() {
    idleCallback(() => {
      this.calculatorInitializer.initAssisted();
      this.isInitialized.set(true);
    });
  }
}
