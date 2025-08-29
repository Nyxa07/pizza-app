import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonButton,
  IonBackButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorFormComponent } from 'src/app/features/calculator/calculator-form/calculator-form.component';
import { RouterLink } from '@angular/router';
import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { LucideAngularModule } from 'lucide-angular';
import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
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
  ],
})
export class CalculatorSimplePage {
  constructor(private calculatorState: CalculatorStateService) {
    this.calculatorState.init(
      'simple',
      {
        doughType: DoughType.DIRECT,
        rtRestTime: 4,
        coldRestTime: 0,
      },
      {
        hydrationRatio: true,
        pizzaWeight: true,
        doughType: true,
        coldRestTime: true,
      },
    );
  }
}
