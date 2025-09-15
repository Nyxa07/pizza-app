import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  IonButton,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonModal,
  IonList,
  IonListHeader,
  IonItem,
  IonToggle,
} from '@ionic/angular/standalone';
import { LucideAngularModule, Share2Icon } from 'lucide-angular';
import { Share } from '@capacitor/share';
import { CalculatorStateService } from '../services/calculator-state.service';
import { firstValueFrom, map } from 'rxjs';
import { DirectDoughRecipe } from '../recipes/direct-dough.recipe';
import { PoolishRecipe } from '../recipes/poolish.recipe';
import { RecipeDefConverterService } from '../../recipe/services/recipe-def-converter.service';
import { PoolishDoughRecipe } from '../recipes/poolish-dough.recipe';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RecipeService } from '../../recipe/services/recipe.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CalculatorService } from '../services/calculator.service';

@Component({
  selector: 'app-calculator-state-share',
  templateUrl: './calculator-state-share.component.html',
  styleUrls: ['./calculator-state-share.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    LucideAngularModule,
    TranslatePipe,
    IonModal,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonModal,
    ReactiveFormsModule,
    IonList,
    IonListHeader,
    IonItem,
    IonToggle,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorStateShareComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  readonly ShareIcon = Share2Icon;

  protected poolishDoughRecipe$ = this.calculatorService.results$.pipe(
    map((result) =>
      result?.poolish
        ? this.recipeDefConverter.convert(new PoolishDoughRecipe(result))
        : null,
    ),
  );

  protected directDoughRecipe$ = this.calculatorService.results$.pipe(
    map((result) =>
      result?.dough && !result?.poolish
        ? this.recipeDefConverter.convert(new DirectDoughRecipe(result))
        : null,
    ),
  );

  protected poolishRecipe$ = this.calculatorService.results$.pipe(
    map((result) =>
      result?.poolish
        ? this.recipeDefConverter.convert(new PoolishRecipe(result))
        : null,
    ),
  );

  protected form = this.fb.group({
    onlyIngredients: [false],
    withHelperDescriptions: [false],
  });

  constructor(
    private calculatorService: CalculatorService,
    private recipeDefConverter: RecipeDefConverterService,
    private recipeService: RecipeService,
    private translateService: TranslateService,
    private fb: FormBuilder,
  ) {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value.onlyIngredients) {
        this.form.controls.withHelperDescriptions.disable({ emitEvent: false });
        // this.form.controls.withHelperDescriptions.setValue(false, {
        //   emitEvent: false,
        // });
      } else {
        this.form.controls.withHelperDescriptions.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit() {}

  confirm() {
    this.onShare();
    // this.modal.dismiss(this.form.value);
  }

  cancel() {
    this.modal.dismiss();
  }

  async onShare() {
    const directDoughRecipe = await firstValueFrom(this.directDoughRecipe$);
    const poolishRecipe = await firstValueFrom(this.poolishRecipe$);
    const poolishDoughRecipe = await firstValueFrom(this.poolishDoughRecipe$);

    const withHelperDescriptions = !!this.form.value.withHelperDescriptions;
    const onlyIngredients = !!this.form.value.onlyIngredients;

    const poolishText = poolishRecipe
      ? this.recipeService.getRecipeText(poolishRecipe, {
          withHelperDescriptions,
          onlyIngredients,
        })
      : '';
    const directDoughText = directDoughRecipe
      ? this.recipeService.getRecipeText(directDoughRecipe, {
          withHelperDescriptions,
          onlyIngredients,
        })
      : '';
    const poolishDoughText = poolishDoughRecipe
      ? this.recipeService.getRecipeText(poolishDoughRecipe, {
          withHelperDescriptions,
          onlyIngredients,
        })
      : '';

    const text = `${poolishText}\n${directDoughText}\n${poolishDoughText}`;

    await Share.share({
      title: this.translateService.instant('calculator.share.title'),
      text,
      // url: 'pizzamaker://calculator/results',
      dialogTitle: this.translateService.instant(
        'calculator.share.dialogTitle',
      ),
    });
  }
}
