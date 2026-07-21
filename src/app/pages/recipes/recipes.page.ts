import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import {
  ArrowRightIcon,
  LucideAngularModule,
  PizzaIcon,
  SettingsIcon,
} from 'lucide-angular';

import { RecipeCatalogService } from 'src/app/features/recipes/services/recipe-catalog.service';

@Component({
  selector: 'app-recipes-page',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    TranslatePipe,
    LucideAngularModule,
    RouterLink,
  ],
})
export class RecipesPage {
  private readonly catalog = inject(RecipeCatalogService);
  private readonly router = inject(Router);

  protected readonly ArrowRightIcon = ArrowRightIcon;
  protected readonly PizzaIcon = PizzaIcon;
  protected readonly SettingsIcon = SettingsIcon;
  protected readonly recipes = this.catalog.list();

  protected open(id: string): void {
    this.router.navigate(['/tabs/recipes', id]);
  }
}
