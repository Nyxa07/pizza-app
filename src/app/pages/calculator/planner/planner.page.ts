import { Component, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButton,
  IonItem,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { PlannerFormComponent } from 'src/app/features/calculator/planner-form/planner-form.component';
import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';

@Component({
  selector: 'calculator-planner-page',
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    TranslatePipe,
    IonButtons,
    IonBackButton,
    PlannerFormComponent,
    CalculatorRefreshButtonComponent,
    IonButton,
    LucideAngularModule,
    RouterLink,
    IonItem,
    IonSkeletonText,
  ],
})
export class CalculatorPlannerPage implements OnInit {
  readonly SettingsIcon = SettingsIcon;
  protected isInitialized = signal(false);

  constructor(private calculatorState: CalculatorStateService) {}

  ngOnInit() {
    // Defer initialization to avoid blocking constructor
    idleCallback(() => {
      this.calculatorState.init(
        'planner',
        {
          preparationDate: new Date().getTime(),
          cookingDate: new Date(
            new Date().getTime() + 4 * 60 * 60 * 1000,
          ).getTime(),
        },
        {
          rtRestTime: true,
          coldRestTime: true,
          preparationDate: false,
          cookingDate: false,
        },
      );
      this.isInitialized.set(true);
    });
  }
}
