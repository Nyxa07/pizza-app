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
import { PlannerFormComponent } from 'src/app/features/calculator/planner-form/planner-form.component';

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
    PlannerFormComponent,
  ],
})
export class CalculatorPlannerPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
