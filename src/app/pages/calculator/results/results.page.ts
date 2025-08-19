import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorRecipeService } from 'src/app/features/calculator/services/calculator-recipe.service';
import { RecipeComponent } from 'src/app/features/recipe/recipe.component';

@Component({
  selector: 'calculator-results-page',
  templateUrl: './results.page.html',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    IonButtons,
    TranslatePipe,
    IonBackButton,
    AsyncPipe,
    RecipeComponent,
  ],
})
export class CalculatorResultsPage implements OnInit {
  protected poolishRecipe$ = this.calculatorRecipeService.poolishRecipe$;

  protected poolishDoughRecipe$ =
    this.calculatorRecipeService.poolishDoughRecipe$;

  protected directDoughRecipe$ =
    this.calculatorRecipeService.directDoughRecipe$;

  constructor(private calculatorRecipeService: CalculatorRecipeService) {}

  ngOnInit() {}
}
