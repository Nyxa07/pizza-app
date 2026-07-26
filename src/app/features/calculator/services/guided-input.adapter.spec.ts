import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { IGuidedCalculatorDraft } from '../interfaces/guided-calculator-draft.interface';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { GuidedInputAdapter } from './guided-input.adapter';

describe('GuidedInputAdapter', () => {
  let adapter: GuidedInputAdapter;
  let draft: IGuidedCalculatorDraft;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: new FakePrefsStorage() }],
    });
    adapter = TestBed.inject(GuidedInputAdapter);
    draft = {
      pizzaType: PizzaType.ROMAN,
      nbPizzas: 4,
      doughType: DoughType.POOLISH,
      globalRestTime: 24,
      temperature: 22,
      yeastType: YeastType.FRESH,
    };
  });

  it('always applies W270 and removes hidden rest splits', () => {
    const input = adapter.resolve(draft);

    expect(input.flourStrength).toBe(270);
    expect(input.hydrationRatio).toBeNull();
    expect(input.globalRestTime).toBe(24);
    expect(input.rtRestTime).toBeNull();
    expect(input.coldRestTime).toBeNull();
  });

  it('maps every explicit Guided answer without hidden Expert data', () => {
    const input = adapter.resolve(draft);

    expect(input).toEqual(
      jasmine.objectContaining({
        pizzaType: PizzaType.ROMAN,
        flourStrength: 270,
        nbPizzas: 4,
        doughType: DoughType.POOLISH,
        temperature: 22,
        yeastType: YeastType.FRESH,
        pizzaWeight: null,
        oliveOilRatio: null,
      }),
    );
  });
});
