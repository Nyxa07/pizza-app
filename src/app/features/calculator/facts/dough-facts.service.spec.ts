import { TestBed } from '@angular/core/testing';

import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughType } from '../enums/dough-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { GUIDED_PATH } from '../paths/guided.path';
import { CalculatorConfigService } from '../services/calculator-config.service';
import { DoughDefaultsService } from '../services/dough-defaults.service';
import {
  DIRECT_INPUT,
  POOLISH_INPUT,
  inputWith,
} from '../testing/calculator-input.fixture';
import { DoughFacts } from './dough-facts.service';

/**
 * The Dough facts module through its own interface: an input in, the figures
 * every surface shows out. The engine is a seam behind it — no spec below
 * fabricates an engine output, and none mounts a screen to read a number.
 */
describe('DoughFacts', () => {
  let facts: DoughFacts;

  /** An input as the Guided path resolves one: every hidden field on auto. */
  const guidedInput = (): ICalculatorInput => {
    const defaults = TestBed.inject(DoughDefaultsService).getDefaults();

    return GUIDED_PATH.toInput(GUIDED_PATH.seed(defaults), defaults);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: new FakePrefsStorage() }],
    });
    facts = TestBed.inject(DoughFacts);
  });

  describe('where the dough sleeps', () => {
    it('reads the rest off the poolish when the dough carries one', () => {
      const { ambientHours, coldHours } = facts.factsOf(POOLISH_INPUT);

      expect(ambientHours).toBe(16);
      expect(coldHours).toBe(8);
    });

    it('reads the rest off the dough itself when it is direct', () => {
      const { ambientHours, coldHours } = facts.factsOf(DIRECT_INPUT);

      expect(ambientHours).toBe(8);
      expect(coldHours).toBe(0);
    });

    it('splits a rest left to the engine in whichever part carries it', () => {
      const asked = {
        globalRestTime: 25,
        rtRestTime: null,
        coldRestTime: null,
      };
      const direct = facts.factsOf(
        inputWith({
          ...asked,
          doughType: DoughType.DIRECT,
          poolishRatio: null,
        }),
      );
      const poolish = facts.factsOf(
        inputWith({ ...asked, doughType: DoughType.POOLISH }),
      );

      // Reading the wrong part of the output would leave both hours at zero.
      expect(direct.restHours).toBe(25);
      expect(poolish.restHours).toBe(25);
      // A direct dough rests mostly at room temperature; a poolish sends the
      // bulk of its rest to the fridge.
      expect(direct.ambientHours).toBeGreaterThan(direct.coldHours);
      expect(poolish.coldHours).toBeGreaterThan(poolish.ambientHours);
    });
  });

  describe('the precision each figure carries', () => {
    it('weighs the ball and the whole dough to the gram', () => {
      const { ballWeight, totalWeight, split } = facts.factsOf(POOLISH_INPUT);

      expect(ballWeight).toBe(250);
      expect(Number.isInteger(totalWeight)).toBeTrue();
      // Every ingredient is in there, the extras included.
      expect(totalWeight).toBeGreaterThan(
        split.flour + split.water + split.salt,
      );
    });

    it('weighs the split as the Méthode does: the yeast at the centigram', () => {
      const { split } = facts.factsOf(POOLISH_INPUT);

      for (const grams of [split.flour, split.water, split.salt]) {
        expect(Number.isInteger(grams)).toBeTrue();
      }
      // A poolish doses a fraction of a gram of yeast: read to the gram it
      // would disappear, so it keeps its two decimals.
      expect(split.yeast).toBeGreaterThan(0);
      expect(Number.isInteger(split.yeast)).toBeFalse();
      expect(Math.round(split.yeast * 100)).toBe(split.yeast * 100);
    });

    it('reads the hydration as a whole percentage', () => {
      const { hydrationPct } = facts.factsOf(POOLISH_INPUT);

      expect(hydrationPct).toBe(62);
    });

    it('reads both rests as whole hours', () => {
      const { ambientHours, coldHours } = facts.factsOf(
        inputWith({ rtRestTime: 16.4, coldRestTime: 8.4 }),
      );

      expect(ambientHours).toBe(16);
      expect(coldHours).toBe(8);
    });
  });

  describe('the total rest', () => {
    it('sums the two rests as they are shown, never the raw ones', () => {
      const { restHours } = facts.factsOf(
        inputWith({ rtRestTime: 16.4, coldRestTime: 8.4 }),
      );

      // The document reads « 16 h + 8 h »; a Recipe totalling the raw hours
      // would announce 25 h and contradict it by a whole hour.
      expect(restHours).toBe(24);
    });

    it('holds for a dough resting in one part only', () => {
      const { ambientHours, coldHours, restHours } =
        facts.factsOf(DIRECT_INPUT);

      expect(restHours).toBe(ambientHours + coldHours);
    });
  });

  describe('the resolved hydration ratio', () => {
    it('carries what the user typed, unrounded', () => {
      const typed = facts.factsOf(inputWith({ hydrationRatio: 0.617 }));

      // The Expert hydration step walks a grid of hundredths: reading the
      // ratio back from the whole percentage would skip a value.
      expect(typed.hydrationRatio).toBe(0.617);
      expect(typed.hydrationPct).toBe(62);
    });

    it('resolves a hydration the Guided path never asked for', () => {
      const input = guidedInput();
      expect(input.hydrationRatio)
        .withContext('the Guided path does not ask for hydration (ADR-0003)')
        .toBeNull();

      const { hydrationRatio, hydrationPct } = facts.factsOf(input);

      const bounds = TestBed.inject(CalculatorConfigService).constants
        .hydrationRecommendation[PizzaType.NEAPOLITAN];
      expect(hydrationRatio).toBeGreaterThanOrEqual(bounds.minHydration);
      expect(hydrationRatio).toBeLessThanOrEqual(bounds.maxHydration);
      expect(hydrationPct).toBe(Math.round(hydrationRatio * 100));
    });
  });

  it('resolves every fact of a Guided input, without a hole', () => {
    const input = guidedInput();

    const dough = facts.factsOf(input);

    expect(dough.balls).toBe(input.nbPizzas);
    expect(dough.doughType).toBe(input.doughType);
    for (const figure of [
      dough.ballWeight,
      dough.totalWeight,
      dough.hydrationPct,
      dough.split.flour,
      dough.split.water,
      dough.split.salt,
      dough.split.yeast,
    ]) {
      expect(figure).toBeGreaterThan(0);
    }
    expect(dough.restHours).toBeGreaterThan(0);
  });

  it('never re-reads « my dough defaults » for an input already saved', () => {
    const input = guidedInput();
    const before = facts.factsOf(input);

    TestBed.inject(DoughDefaultsService).update({
      hydrationRatio: 0.8,
      pizzaWeight: 400,
      saltRatio: 0.05,
      globalRestTime: 72,
    });

    // The document semantics of ADR-0002: saved values are used as saved.
    expect(facts.factsOf(input)).toEqual(before);
  });
});
