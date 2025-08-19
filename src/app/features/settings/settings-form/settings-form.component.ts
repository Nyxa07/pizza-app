import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonItem,
  IonList,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { LocaleManagerService } from '../../locales/services/locale-manager.service';
import { Locales } from '../../locales/enums/locales.enum';
import { ThemeService } from '../../theme/services/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonSelect,
    IonSelectOption,
    TranslatePipe,
    ReactiveFormsModule,
    IonToggle,
    IonList,
    IonListHeader,
  ],
})
export class SettingsFormComponent implements OnInit {
  availableLocales = Object.entries(Locales).map(([_, value]) => ({
    translateKey: `language.selector.${value}`,
    value,
  }));

  form = this.fb.group({
    locale: [this.localeManager.getLocale(), Validators.required],
    paletteToggle: [this.themeService.isDarkMode()],
  });

  constructor(
    private localeManager: LocaleManagerService,
    private themeService: ThemeService,
    private fb: FormBuilder,
  ) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(250))
      .subscribe((value) => {
        if (!this.form.valid) {
          return;
        }
        this.localeManager.switchLocale(value.locale ?? '');
        this.themeService.setDarkMode(value.paletteToggle ?? false);
      });
  }

  ngOnInit() {}
}
