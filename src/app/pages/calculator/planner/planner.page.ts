import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { PlannerFormComponent } from 'src/app/features/calculator/planner-form/planner-form.component';
import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';

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
  ],
})
export class CalculatorPlannerPage {
  readonly SettingsIcon = SettingsIcon;
  constructor(calculatorState: CalculatorStateService) {
    calculatorState.init(
      'planner',
      {},
      {
        rtRestTime: true,
        coldRestTime: true,
        preparationDate: false,
        cookingDate: false,
      },
    );
  }
}
