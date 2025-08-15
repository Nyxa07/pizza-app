import { Component, Input, OnInit } from '@angular/core';
import { DoughResult } from '../services/dough-calculator.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationKeys } from '../../../shared/services/translation-keys.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dough-quantity',
  templateUrl: './dough-quantity.component.html',
  styleUrls: ['./dough-quantity.component.scss'],
  imports: [TranslateModule, DecimalPipe],
  standalone: true,
})
export class DoughQuantityComponent implements OnInit {
  @Input({ required: true }) result!: DoughResult | null;

  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;

  constructor() {}
  ngOnInit() {}
}
