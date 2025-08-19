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
import { RecipeComponent } from 'src/app/features/recipe/recipe.component';
import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
import { PoolishDoughRecipe } from 'src/app/features/calculator/recipes/poolish-dough.recipe';
import { filter, map } from 'rxjs/operators';
import { DirectDoughRecipe } from 'src/app/features/calculator/recipes/direct-dough.recipe';
import { PoolishRecipe } from 'src/app/features/calculator/recipes/poolish.recipe';

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
  protected poolishDoughRecipe$ = this.calculatorState.result$.pipe(
    filter((result) => !!result?.poolish),
    map((result) => new PoolishDoughRecipe(result)),
  );

  protected directDoughRecipe$ = this.calculatorState.result$.pipe(
    filter((result) => !!result?.dough),
    map((result) => new DirectDoughRecipe(result)),
  );

  protected poolishRecipe$ = this.calculatorState.result$.pipe(
    filter((result) => !!result?.poolish),
    map((result) => new PoolishRecipe(result)),
  );

  constructor(private calculatorState: CalculatorStateService) {}

  ngOnInit() {}
}
