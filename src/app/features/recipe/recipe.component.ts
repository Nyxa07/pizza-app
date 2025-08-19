import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonModal,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  IRecipe,
  IRecipeHelper,
} from 'src/app/features/recipe/interfaces/recipe.interface';
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
    IonModal,
  ],
})
export class RecipeComponent implements OnInit {
  @Input({ required: true }) recipe!: IRecipe;
  @ViewChild('helperModal') helperModal!: IonModal;
  currentHelper: IRecipeHelper | null = null;

  constructor() {}

  ngOnInit() {}

  openHelperModal(helper?: IRecipeHelper) {
    if (!helper) {
      return;
    }

    this.currentHelper = helper;
    this.helperModal.present();
  }
}
