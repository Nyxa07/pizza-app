import { Component, input, OnInit } from '@angular/core';
import { DoughPoolishRecipeComponent } from './dough-poolish-recipe/dough-poolish-recipe.component';
import { DoughDirectRecipeComponent } from './dough-direct-recipe/dough-direct-recipe.component';
import { DoughResult } from '../services/dough-calculator.service';

@Component({
  selector: 'app-dough-recipe',
  templateUrl: './dough-recipe.component.html',
  styleUrls: ['./dough-recipe.component.scss'],
  imports: [DoughPoolishRecipeComponent, DoughDirectRecipeComponent],
})
export class DoughRecipeComponent implements OnInit {
  result = input.required<DoughResult>();
  constructor() {}

  ngOnInit() {}
}
