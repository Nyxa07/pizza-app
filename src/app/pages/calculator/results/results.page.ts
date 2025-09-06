import { Component, OnInit, signal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { RecipeComponent } from 'src/app/features/recipe/recipe.component';
import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
import { PoolishDoughRecipe } from 'src/app/features/calculator/recipes/poolish-dough.recipe';
import { filter, map } from 'rxjs/operators';
import { DirectDoughRecipe } from 'src/app/features/calculator/recipes/direct-dough.recipe';
import { PoolishRecipe } from 'src/app/features/calculator/recipes/poolish.recipe';
import { RecipeDefConverterService } from 'src/app/features/recipe/services/recipe-def-converter.service';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';
import { CalculatorStateShareComponent } from 'src/app/features/calculator/calculator-state-share/calculator-state-share.component';

@Component({
  selector: 'calculator-results-page',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
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
    IonItem,
    IonSkeletonText,
    CalculatorStateShareComponent,
  ],
})
export class CalculatorResultsPage implements OnInit {
  protected isInitialized = signal(false);
  protected poolishDoughRecipe$ = this.calculatorState.result$.pipe(
    filter((result) => !!result?.poolish),
    map((result) =>
      this.recipeDefConverter.convert(new PoolishDoughRecipe(result)),
    ),
  );

  protected directDoughRecipe$ = this.calculatorState.result$.pipe(
    filter((result) => !!result?.dough),
    map((result) =>
      this.recipeDefConverter.convert(new DirectDoughRecipe(result)),
    ),
  );

  protected poolishRecipe$ = this.calculatorState.result$.pipe(
    filter((result) => !!result?.poolish),
    map((result) => this.recipeDefConverter.convert(new PoolishRecipe(result))),
  );

  constructor(
    private calculatorState: CalculatorStateService,
    private recipeDefConverter: RecipeDefConverterService,
  ) {}

  ngOnInit() {
    idleCallback(() => {
      this.isInitialized.set(true);
    });
  }
}
