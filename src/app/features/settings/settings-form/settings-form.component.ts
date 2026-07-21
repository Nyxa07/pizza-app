import { Component, inject } from '@angular/core';
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
import { Appearance } from '../enums/appearance.enum';
import { Locales } from '../enums/locales.enum';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { KeepAwakeService } from 'src/app/features/settings/services/keep-awake.service';
import { AppearanceService } from '../services/appearance.service';
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
export class SettingsFormComponent {
  private readonly localeManager = inject(LocaleManagerService);
  private readonly fb = inject(FormBuilder);
  private readonly keepAwakeService = inject(KeepAwakeService);
  private readonly appearanceService = inject(AppearanceService);

  protected readonly availableLocales = Object.entries(Locales).map(([_, value]) => ({
    translateKey: `settings.form.system.language.${value}`,
    value,
  }));

  protected readonly availableAppearances = Object.values(Appearance).map(
    (value) => ({
      translateKey: `settings.form.appearance.select.${value}`,
      value,
    }),
  );

  form = this.fb.group({
    locale: [this.localeManager.getLocale(), Validators.required],
    keepAwake: [this.keepAwakeService.isKeptAwake()],
    appearance: [this.appearanceService.appearance(), Validators.required],
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(250))
      .subscribe((value) => {
        if (!this.form.valid) {
          return;
        }
        this.localeManager.switchLocale(value.locale ?? '');
        this.keepAwakeService.setKeepAwake(value.keepAwake ?? false);
        if (value.appearance) {
          this.appearanceService.setAppearance(value.appearance);
        }
      });
  }
}
