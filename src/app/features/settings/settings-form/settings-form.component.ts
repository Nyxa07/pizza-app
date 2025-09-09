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
import { ThemeService } from '../services/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { KeepAwakeService } from 'src/app/features/settings/services/keep-awake.service';
import { LocaleManagerService } from '../services/locale-manager.service';

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
    translateKey: `settings.form.system.language.${value}`,
    value,
  }));

  form = this.fb.group({
    locale: [this.localeManager.getLocale(), Validators.required],
    paletteToggle: [this.themeService.isDarkMode()],
    keepAwake: [this.keepAwakeService.isKeptAwake()],
  });

  constructor(
    private localeManager: LocaleManagerService,
    private themeService: ThemeService,
    private fb: FormBuilder,
    private keepAwakeService: KeepAwakeService,
  ) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(250))
      .subscribe((value) => {
        if (!this.form.valid) {
          return;
        }
        this.localeManager.switchLocale(value.locale ?? '');
        this.themeService.setDarkMode(value.paletteToggle ?? false);
        this.keepAwakeService.setKeepAwake(value.keepAwake ?? false);
      });
  }

  ngOnInit() {}
}
