import { Component, Input, OnInit } from '@angular/core';
import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { IRecipe } from 'src/app/features/recipe/interfaces/recipe.interface';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss'],
  standalone: true,
  imports: [
    LucideAngularModule,
    IonListHeader,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    NumberPipe,
    TranslatePipe,
  ],
})
export class RecipeComponent implements OnInit {
  @Input({ required: true }) recipe!: IRecipe;

  constructor() {}

  ngOnInit() {}
}
