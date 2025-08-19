import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-index-page',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    TranslatePipe,
    IonContent,
    IonButton,
    IonButtons,
    LucideAngularModule,
    RouterLink,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ],
})
export class HomeIndexPage implements OnInit {
  readonly SettingsIcon = SettingsIcon;
  protected readonly items = [
    {
      title: 'pages.home.calculator.title',
      subtitle: 'pages.home.calculator.subtitle',
      routerLink: ['/tabs/calculator'],
      content: 'pages.home.calculator.content',
    },
    {
      title: 'pages.home.faq.title',
      subtitle: 'pages.home.faq.subtitle',
      routerLink: ['/tabs/guides/faq'],
      content: 'pages.home.faq.content',
    },
  ];

  ngOnInit() {}
}
