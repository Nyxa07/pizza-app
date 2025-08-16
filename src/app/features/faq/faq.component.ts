import { Component, OnInit } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { LocaleManagerService } from '../locales/services/locale-manager.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  imports: [
    TranslatePipe,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
  ],
})
export class FaqComponent implements OnInit {
  questionsData: {
    title: string;
    subtitle: string;
    answers: string[];
    tips?: { title: string; description: string }[];
  }[] = [];
  locale = this.localeManagerService.getLocale();

  constructor(private localeManagerService: LocaleManagerService) {}

  async ngOnInit() {
    const data = await import(`../../../assets/i18n/${this.locale}/faq.json`);
    this.questionsData = data.questions;
  }
}
