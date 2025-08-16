import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonItem, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { LocaleManagerService } from '../../locales/services/locale-manager.service';
import { Locales } from '../../locales/enums/locales.enum';

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
  ],
})
export class SettingsFormComponent implements OnInit {
  fb = inject(FormBuilder);
  localeManager = inject(LocaleManagerService);
  availableLocales = Object.entries(Locales).map(([_, value]) => ({
    translateKey: `language.selector.${value}`,
    value,
  }));
  form = this.fb.group({
    locale: [this.localeManager.getLocale(), Validators.required],
  });

  constructor() {
    this.form
      .get('locale')
      ?.valueChanges.pipe(
        takeUntilDestroyed(),
        debounceTime(150),
        distinctUntilChanged(),
      )
      .subscribe((value) => {
        this.localeManager.switchLocale(value as string);
      });
  }

  ngOnInit() {}
}
