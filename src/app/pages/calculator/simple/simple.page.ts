import { Component, OnInit, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonButton,
  IonBackButton,
  IonItem,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorFormComponent } from 'src/app/features/calculator/calculator-form/calculator-form.component';
import { RouterLink } from '@angular/router';
import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { LucideAngularModule } from 'lucide-angular';
import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';
import { CalculatorSettingsService } from 'src/app/features/calculator/services/calculator-settings.service';
import { DoughType } from 'src/app/features/calculator/enums/dough-type.enum';

@Component({
  selector: 'calculator-simple-page',
  templateUrl: './simple.page.html',
  styleUrls: ['./simple.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    TranslatePipe,
    CalculatorFormComponent,
    IonContent,
    IonButton,
    IonBackButton,
    CalculatorRefreshButtonComponent,
    RouterLink,
    LucideAngularModule,
    IonItem,
    IonSkeletonText,
    IonButton,
    RouterLink,
    CalculatorFormComponent,
    CalculatorRefreshButtonComponent,
  ],
})
export class CalculatorSimplePage implements OnInit {
  protected isInitialized = signal(false);

  constructor(
    private calculatorState: CalculatorStateService,
    private settings: CalculatorSettingsService,
  ) {}

  ngOnInit() {
    idleCallback(() => {
      this.settings.init('simple', {
        saltRatio: { auto: true, visible: false },
        honeyRatio: { auto: true, visible: false },
        flourStrength: { auto: true, visible: false },
        hydrationRatio: { auto: true, visible: false },
        doughType: { auto: true, visible: false },
        poolishRatio: { auto: true, visible: false },
        yeastType: { auto: false, visible: true },
        coldRestTime: { auto: true, visible: false },
        pizzaWeight: { auto: true, visible: false },
      });
      this.calculatorState.init('simple', {
        doughType: DoughType.DIRECT,
      });
      this.isInitialized.set(true);
    });
  }
}
