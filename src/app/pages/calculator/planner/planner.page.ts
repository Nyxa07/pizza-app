import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonBackButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'calculator-planner-page',
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    TranslatePipe,
    IonButtons,
    IonBackButton,
  ],
})
export class CalculatorPlannerPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
