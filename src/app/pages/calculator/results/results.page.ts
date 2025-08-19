import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorResultsComponent } from 'src/app/features/calculator/calculator-results/calculator-results.component';

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
    FormsModule,
    IonButtons,
    TranslatePipe,
    IonBackButton,
    CalculatorResultsComponent,
  ],
})
export class CalculatorResultsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
