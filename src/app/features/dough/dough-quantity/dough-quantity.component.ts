import { Component, inject, Input, OnInit } from '@angular/core';
import { DoughResult } from '../services/dough-calculator.service';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleManagerService } from '../../locales/services/locale-manager.service';

@Component({
  selector: 'app-dough-quantity',
  templateUrl: './dough-quantity.component.html',
  styleUrls: ['./dough-quantity.component.scss'],
  imports: [TranslateModule],
  standalone: true,
})
export class DoughQuantityComponent implements OnInit {
  @Input({ required: true }) result!: DoughResult | null;

  protected localeManager = inject(LocaleManagerService);
  protected currentLocale = this.localeManager.getLocale();

  constructor() {}
  ngOnInit() {}

  round(value: number) {
    return Math.round(value);
  }
}
