import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  AUTO_COMPUTE_INPUTS,
  CalculatorStateService,
} from 'src/app/features/calculator/services/calculator-state.service';
import { DoughType } from 'src/app/features/calculator/enums/dough-type.enum';

@Component({
  selector: 'calculator-index-page',
  templateUrl: './index.page.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    TranslatePipe,
    IonContent,
    IonBackButton,
    LucideAngularModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class CalculatorIndexPage {
  constructor(
    private router: Router,
    private calculatorState: CalculatorStateService,
  ) {}
  protected readonly items = [
    {
      title: 'pages.calculator.simple.title',
      description: 'pages.calculator.simple.description',
      action: () => {
        this.calculatorState.updateAutoCompute({
          ...AUTO_COMPUTE_INPUTS,
          hydrationRatio: true,
          pizzaWeight: true,
          doughType: true,
        });
        this.calculatorState.init({ doughType: DoughType.DIRECT });
        this.router.navigate(['/tabs/calculator/simple']);
      },
    },
    {
      title: 'pages.calculator.complex.title',
      description: 'pages.calculator.complex.description',
      action: () => {
        this.calculatorState.updateAutoCompute(AUTO_COMPUTE_INPUTS);
        this.calculatorState.init();
        this.router.navigate(['/tabs/calculator/complex']);
      },
    },
    {
      title: 'pages.calculator.planner.title',
      description: 'pages.calculator.planner.description',
      action: () => {
        this.calculatorState.updateAutoCompute({
          ...AUTO_COMPUTE_INPUTS,
          rtRestTime: true,
          coldRestTime: true,
          preparationDate: false,
          cookingDate: false,
        });
        this.calculatorState.init();
        this.router.navigate(['/tabs/calculator/planner']);
      },
    },
  ];
}
