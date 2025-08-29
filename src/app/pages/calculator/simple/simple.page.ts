import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonButton,
  IonBackButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorFormComponent } from 'src/app/features/calculator/calculator-form/calculator-form.component';
import { RouterLink } from '@angular/router';
import { CalculatorRefreshButtonComponent } from 'src/app/features/calculator/calculator-refresh-button/calculator-refresh-button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'calculator-simple-page',
  templateUrl: './simple.page.html',
  styleUrls: ['./simple.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    TranslatePipe,
    CalculatorFormComponent,
    IonContent,
    IonButton,
    IonBackButton,
    CalculatorRefreshButtonComponent,
    RouterLink,
    LucideAngularModule,
  ],
})
export class CalculatorSimplePage {
  constructor() {}
}
