import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { PizzaType } from '../../../settings/enums/pizza-type.enum';
import { DoughType } from '../../enums/dough-type.enum';
import { YeastType } from '../../enums/yeast-type.enum';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { ICalculatorSettings } from '../../interfaces/calculator-settings.interface';
import { DoughDefaultsService } from '../dough-defaults.service';
import { FillMissingPreProcessor } from './transform-input.pre-processor';

const flag = (auto = false): { auto: boolean } => ({ auto });

const settingsWithAuto = (
  auto: Partial<Record<keyof ICalculatorSettings, boolean>>,
): ICalculatorSettings => ({
  pizzaWeight: flag(auto.pizzaWeight),
  saltRatio: flag(auto.saltRatio),
  honeyRatio: flag(auto.honeyRatio),
  flourStrength: flag(auto.flourStrength),
  hydrationRatio: flag(auto.hydrationRatio),
  doughType: flag(auto.doughType),
  poolishRatio: flag(auto.poolishRatio),
  yeastType: flag(auto.yeastType),
  temperature: flag(auto.temperature),
  globalRestTime: flag(auto.globalRestTime),
  rtRestTime: flag(auto.rtRestTime),
  coldRestTime: flag(auto.coldRestTime),
  oliveOilRatio: flag(auto.oliveOilRatio),
});

const typedInput: ICalculatorInput = {
  nbPizzas: 3,
  doughType: DoughType.POOLISH,
  yeastType: YeastType.FRESH,
  hydrationRatio: 0.58,
  temperature: 22,
  poolishRatio: 0.3,
  globalRestTime: 48,
  rtRestTime: 4,
  coldRestTime: 44,
  flourStrength: 220,
  saltRatio: 0.02,
  honeyRatio: 0.01,
  pizzaWeight: 280,
  pizzaType: PizzaType.NEAPOLITAN,
  oliveOilRatio: 0.02,
};

describe('FillMissingPreProcessor', () => {
  let defaults: DoughDefaultsService;
  let processor: FillMissingPreProcessor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: new FakePrefsStorage() }],
    });
    defaults = TestBed.inject(DoughDefaultsService);
    processor = TestBed.inject(FillMissingPreProcessor);
  });

  it('auto fields fall back to the user Defaults, not factory values', () => {
    defaults.update({ saltRatio: 0.035, flourStrength: 320 });

    const output = processor.process(
      settingsWithAuto({ saltRatio: true, flourStrength: true }),
      typedInput,
    );

    expect(output.saltRatio).toBe(0.035);
    expect(output.flourStrength).toBe(320);
  });

  it('non-auto fields keep the value the user typed', () => {
    defaults.update({ saltRatio: 0.035 });

    const output = processor.process(settingsWithAuto({}), typedInput);

    expect(output.saltRatio).toBe(0.02);
    expect(output.flourStrength).toBe(220);
  });
});
