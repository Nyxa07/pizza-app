import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonIcon,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flag, flagOutline } from 'ionicons/icons';
import { TranslateService } from '@ngx-translate/core';
import { TranslationKeys } from '../../services/translation-keys.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
  template: `
    <ion-button fill="clear" (click)="showLanguageSelector()">
      <ion-icon name="flag"></ion-icon>
    </ion-button>
  `,
  styles: [
    `
      ion-button {
        --padding-start: 8px;
        --padding-end: 8px;
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private translateService: TranslateService,
  ) {
    addIcons({ flag, flagOutline });
  }

  getCurrentLanguageCode(): string {
    const currentLang = this.translateService.getCurrentLang();
    switch (currentLang) {
      case 'en':
        return 'EN';
      case 'fr':
        return 'FR';
      case 'it':
        return 'IT';
      case 'es':
        return 'ES';
      case 'hi':
        return 'HI';
      case 'ja':
        return 'JA';
      case 'zh':
        return 'ZH';
      case 'de':
        return 'DE';
      default:
        return 'EN';
    }
  }

  getFlagIcon(lang: string): string {
    return lang === this.translateService.getCurrentLang()
      ? 'flag'
      : 'flag-outline';
  }

  async showLanguageSelector(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translateService.instant(
        TranslationKeys.LANGUAGE.SELECTOR.TITLE,
      ),
      buttons: [
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.ENGLISH,
          ),
          icon: this.getFlagIcon('en'),
          handler: () => this.switchLanguage('en'),
        },
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.FRENCH,
          ),
          icon: this.getFlagIcon('fr'),
          handler: () => this.switchLanguage('fr'),
        },
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.ITALIAN,
          ),
          icon: this.getFlagIcon('it'),
          handler: () => this.switchLanguage('it'),
        },
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.SPANISH,
          ),
          icon: this.getFlagIcon('es'),
          handler: () => this.switchLanguage('es'),
        },
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.HINDI,
          ),
          icon: this.getFlagIcon('hi'),
          handler: () => this.switchLanguage('hi'),
        },
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.JAPANESE,
          ),
          icon: this.getFlagIcon('ja'),
          handler: () => this.switchLanguage('ja'),
        },
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.CHINESE,
          ),
          icon: this.getFlagIcon('zh'),
          handler: () => this.switchLanguage('zh'),
        },
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.GERMAN,
          ),
          icon: this.getFlagIcon('de'),
          handler: () => this.switchLanguage('de'),
        },
        {
          text: this.translateService.instant(
            TranslationKeys.LANGUAGE.SELECTOR.CANCEL,
          ),
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  private switchLanguage(locale: string): void {
    this.translateService.use(locale);
  }
}
