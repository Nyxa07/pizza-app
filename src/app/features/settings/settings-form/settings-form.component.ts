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
import { Locales } from '../enums/locales.enum';
import { Theme } from '../enums/theme.enum';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { KeepAwakeService } from 'src/app/features/settings/services/keep-awake.service';
import { LocaleManagerService } from '../services/locale-manager.service';
import { ThemeService } from '../services/theme.service';

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
  protected readonly availableLocales = Object.entries(Locales).map(([_, value]) => ({
    translateKey: `settings.form.system.language.${value}`,
    value,
  }));

  protected readonly availableThemes = Object.entries(Theme).map(([_, value]) => ({
    translateKey: `settings.form.appearance.theme.${value}`,
    value,
  }));

  form = this.fb.group({
    locale: [this.localeManager.getLocale(), Validators.required],
    keepAwake: [this.keepAwakeService.isKeptAwake()],
    theme: [this.themeService.getTheme(), Validators.required],
  });

  constructor(
    private localeManager: LocaleManagerService,
    private fb: FormBuilder,
    private keepAwakeService: KeepAwakeService,
    private themeService: ThemeService,
  ) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(250))
      .subscribe((value) => {
        if (!this.form.valid) {
          return;
        }
        this.localeManager.switchLocale(value.locale ?? '');
        this.keepAwakeService.setKeepAwake(value.keepAwake ?? false);
        if (value.theme) {
          this.themeService.setTheme(value.theme);
        }
      });
  }

  ngOnInit() {}
}
