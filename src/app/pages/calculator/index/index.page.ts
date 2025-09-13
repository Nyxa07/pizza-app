import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'calculator-index-page',
  templateUrl: './index.page.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    TranslatePipe,
    IonContent,
    IonBackButton,
    LucideAngularModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    RouterLink,
  ],
})
export class CalculatorIndexPage {
  constructor(private router: Router) {}
  protected readonly items = [
    {
      title: 'pages.calculator.assistant.title',
      description: 'pages.calculator.assistant.description',
      link: '/tabs/calculator/assistant',
    },
    {
      title: 'pages.calculator.simple.title',
      description: 'pages.calculator.simple.description',
      link: '/tabs/calculator/simple',
    },
    {
      title: 'pages.calculator.complex.title',
      description: 'pages.calculator.complex.description',
      link: '/tabs/calculator/complex',
    },
  ];
}
