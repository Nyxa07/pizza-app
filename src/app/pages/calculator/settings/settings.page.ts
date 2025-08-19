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
import { CalculatorSettingsFormComponent } from 'src/app/features/calculator/calculator-settings-form/calculator-settings-form.component';

@Component({
  selector: 'calculator-settings-page',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButtons,
    IonBackButton,
    TranslatePipe,
    CalculatorSettingsFormComponent,
  ],
})
export class CalculatorSettingsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
