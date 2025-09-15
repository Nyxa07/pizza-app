import { Component, effect, OnInit, signal } from '@angular/core';
import { IonListHeader } from '@ionic/angular/standalone';
import { IonList } from '@ionic/angular/standalone';
import { IonItem } from '@ionic/angular/standalone';
import { IonToggle } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, startWith, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import {
  AnvilIcon,
  CandyCaneIcon,
  CheckCheckIcon,
  HandFistIcon,
  LucideAngularModule,
  SpotlightIcon,
  BubblesIcon,
  WavesIcon,
  FlaskRoundIcon,
} from 'lucide-angular';
import { CalculatorSettingsService } from '../services/calculator-settings.service';

@Component({
  selector: 'app-calculator-settings-form',
  templateUrl: './calculator-settings-form.component.html',
  styleUrls: ['./calculator-settings-form.component.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonToggle,
    TranslatePipe,
    ReactiveFormsModule,
    AsyncPipe,
    IonListHeader,
    LucideAngularModule,
  ],
})
export class CalculatorSettingsFormComponent implements OnInit {
  readonly AnvilIcon = AnvilIcon;
  readonly SpotlightIcon = SpotlightIcon;
  readonly CandyCaneIcon = CandyCaneIcon;
  readonly HandFistIcon = HandFistIcon;
  readonly CheckCheckIcon = CheckCheckIcon;
  readonly BubblesIcon = BubblesIcon;
  readonly WavesIcon = WavesIcon;
  readonly FlaskRoundIcon = FlaskRoundIcon;

  form = this.fb.group({
    pizzaWeight: [this.settings.getSettings().pizzaWeight.visible],
    saltRatio: [this.settings.getSettings().saltRatio.visible],
    honeyRatio: [this.settings.getSettings().honeyRatio.visible],
    flourStrength: [this.settings.getSettings().flourStrength.visible],
    hydrationRatio: [this.settings.getSettings().hydrationRatio.visible],
    poolishRatio: [this.settings.getSettings().poolishRatio.visible],
    oliveOilRatio: [this.settings.getSettings().oliveOilRatio.visible],
  });

  allVisibility$ = this.form.valueChanges.pipe(
    startWith(this.form.value),
    map(
      (value) =>
        value.pizzaWeight &&
        value.saltRatio &&
        value.honeyRatio &&
        value.flourStrength &&
        value.hydrationRatio &&
        value.poolishRatio &&
        value.oliveOilRatio,
    ),
  );

  constructor(
    private settings: CalculatorSettingsService,
    private fb: FormBuilder,
  ) {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.settings.update({
        pizzaWeight: { visible: !!value.pizzaWeight, auto: !value.pizzaWeight },
        saltRatio: { visible: !!value.saltRatio, auto: !value.saltRatio },
        honeyRatio: { visible: !!value.honeyRatio, auto: !value.honeyRatio },
        flourStrength: {
          visible: !!value.flourStrength,
          auto: !value.flourStrength,
        },
        hydrationRatio: {
          visible: !!value.hydrationRatio,
          auto: !value.hydrationRatio,
        },
        poolishRatio: {
          visible: !!value.poolishRatio,
          auto: !value.poolishRatio,
        },
        oliveOilRatio: {
          visible: !!value.oliveOilRatio,
          auto: !value.oliveOilRatio,
        },
      });
    });
  }

  onAllVisibilityChange(event: any) {
    this.form.patchValue({
      pizzaWeight: event.detail.checked,
      saltRatio: event.detail.checked,
      honeyRatio: event.detail.checked,
      flourStrength: event.detail.checked,
      hydrationRatio: event.detail.checked,
      poolishRatio: event.detail.checked,
      oliveOilRatio: event.detail.checked,
    });
  }

  ngOnInit() {}
}
