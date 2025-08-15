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
import {
  LocaleManagerService,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGES_MAP,
} from '../../services/locale-manager.service';

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
    private localeManagerService: LocaleManagerService,
    private translateService: TranslateService,
  ) {
    addIcons({ flag, flagOutline });
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
        ...SUPPORTED_LANGUAGES.map((lang) => ({
          text: this.translateService.instant(
            `app.language.selector.${
              SUPPORTED_LANGUAGES_MAP[
                lang as keyof typeof SUPPORTED_LANGUAGES_MAP
              ]
            }`,
          ),
          icon: this.getFlagIcon(lang),
          handler: () => this.localeManagerService.switchLocale(lang),
        })),
        {
          text: this.translateService.instant(
            TranslationKeys.COMMON.ACTIONS.CANCEL,
          ),
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }
}
