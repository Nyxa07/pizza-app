import { TestBed } from '@angular/core/testing';

import { PizzaType } from '../../../settings/enums/pizza-type.enum';
import { DoughType } from '../../enums/dough-type.enum';
import { YeastType } from '../../enums/yeast-type.enum';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { HydrationProcessor } from './hydration.processor';

describe('HydrationProcessor', () => {
  let processor: HydrationProcessor;

  const input = (
    pizzaType: PizzaType,
    flourStrength: number,
  ): ICalculatorInput => ({
    nbPizzas: 4,
    doughType: DoughType.DIRECT,
    yeastType: YeastType.DRY_ACTIVE,
    hydrationRatio: null,
    temperature: 20,
    poolishRatio: 0.4,
    globalRestTime: 24,
    rtRestTime: null,
    coldRestTime: null,
    flourStrength,
    saltRatio: 0.028,
    honeyRatio: 0.004,
    pizzaWeight: null,
    pizzaType,
    oliveOilRatio: null,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    processor = TestBed.inject(HydrationProcessor);
  });

  [
    { strength: 270, neapolitan: 0.607, roman: 0.55 },
    { strength: 300, neapolitan: 0.628, roman: 0.56875 },
    { strength: 320, neapolitan: 0.642, roman: 0.58125 },
    { strength: 350, neapolitan: 0.663, roman: 0.6 },
  ].forEach(({ strength, neapolitan, roman }) => {
    it(`recommends the sampled hydration for W${strength}`, () => {
      expect(
        processor.process(input(PizzaType.NEAPOLITAN, strength)).hydrationRatio,
      ).toBeCloseTo(neapolitan, 6);
      expect(
        processor.process(input(PizzaType.ROMAN, strength)).hydrationRatio,
      ).toBeCloseTo(roman, 6);
    });
  });

  it('clamps Roman hydration to the 55–60% product range', () => {
    expect(processor.process(input(PizzaType.ROMAN, 200)).hydrationRatio).toBe(
      0.55,
    );
    expect(processor.process(input(PizzaType.ROMAN, 400)).hydrationRatio).toBe(
      0.6,
    );
  });

  it('keeps an explicit Expert hydration unchanged', () => {
    expect(
      processor.process({
        ...input(PizzaType.ROMAN, 350),
        hydrationRatio: 0.71,
      }).hydrationRatio,
    ).toBe(0.71);
  });
});
