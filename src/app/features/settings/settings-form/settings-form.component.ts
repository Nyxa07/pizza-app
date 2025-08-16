import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonInput,
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
import { DoughConfigService } from '../../dough/services/dough-config.service';
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
    IonInput,
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
    pizzaWeight: [
      this.doughConfigService.constants.pizzaWeight,
      [Validators.required, Validators.min(200), Validators.max(400)],
    ],
    saltRatio: [
      Math.round(this.doughConfigService.constants.saltRatio * 100 * 100) / 100,
      [Validators.required, Validators.min(2.8), Validators.max(3.2)],
    ],
    honeyRatio: [
      Math.round(this.doughConfigService.constants.honeyRatio * 100 * 100) /
        100,
      [Validators.required, Validators.min(0), Validators.max(5)],
    ],
  });

  constructor(
    private localeManager: LocaleManagerService,
    private themeService: ThemeService,
    private doughConfigService: DoughConfigService,
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
        this.doughConfigService.update({
          pizzaWeight: value.pizzaWeight ?? 0,
          saltRatio: (value.saltRatio ?? 0) / 100,
          honeyRatio: (value.honeyRatio ?? 0) / 100,
        });
      });
  }

  ngOnInit() {}
}
