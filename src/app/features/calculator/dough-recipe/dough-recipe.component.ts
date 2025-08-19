import { Component } from '@angular/core';
import { DoughFormStateService } from '../services/calculator-state.service';
import { DoughPoolishRecipeComponent } from './dough-poolish-recipe/dough-poolish-recipe.component';
import { DoughDirectRecipeComponent } from './dough-direct-recipe/dough-direct-recipe.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dough-recipe',
  templateUrl: './dough-recipe.component.html',
  styleUrls: ['./dough-recipe.component.scss'],
  imports: [DoughPoolishRecipeComponent, DoughDirectRecipeComponent, AsyncPipe],
})
export class DoughRecipeComponent {
  protected result$ = this.resultDataStore.result$;
  constructor(private resultDataStore: DoughFormStateService) {}
}
