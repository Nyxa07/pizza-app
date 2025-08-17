import { Component, inject, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleManagerService } from '../../locales/services/locale-manager.service';
import { DoughFormStateService } from '../services/dough-form-state.service';
import { AsyncPipe } from '@angular/common';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

@Component({
  selector: 'app-dough-quantity',
  templateUrl: './dough-quantity.component.html',
  styleUrls: ['./dough-quantity.component.scss'],
  imports: [TranslateModule, AsyncPipe, NumberPipe],
  standalone: true,
})
export class DoughQuantityComponent implements OnInit {
  protected currentLocale = this.localeManager.getLocale();
  protected result$ = this.resultDataStore.result$;

  constructor(
    private localeManager: LocaleManagerService,
    private resultDataStore: DoughFormStateService,
  ) {}
  ngOnInit() {}

  round(value: number) {
    return Math.round(value);
  }
}
