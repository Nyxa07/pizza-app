import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import { DoughDefaultsService } from './dough-defaults.service';
import { IntermediateInputAdapter } from './intermediate-input.adapter';

/**
 * The single seam between the Intermediate screen and the engine: every
 * decision the path takes on the user's behalf is concentrated here, and none
 * of them may leak in from the Expert Draft (ADR-0003).
 */
describe('IntermediateInputAdapter', () => {
  let adapter: IntermediateInputAdapter;
  let defaults: DoughDefaultsService;
  let draft: IIntermediateCalculatorDraft;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: new FakePrefsStorage() }],
    });
    adapter = TestBed.inject(IntermediateInputAdapter);
    defaults = TestBed.inject(DoughDefaultsService);
    draft = {
      pizzaType: PizzaType.NEAPOLITAN,
      nbPizzas: 6,
      sizeCm: 30,
      doughType: DoughType.DIRECT,
      globalRestTime: 36,
      temperature: 22,
      yeastType: YeastType.FRESH,
    };
  });

  it('turns the answered size into an explicit ball weight', () => {
    expect(adapter.resolve(draft).pizzaWeight).toBe(270);
    expect(
      adapter.resolve({ ...draft, pizzaType: PizzaType.ROMAN }).pizzaWeight,
    ).toBe(170);
  });

  it('weighs both bounds of both styles from the format model', () => {
    const weightOf = (pizzaType: PizzaType, sizeCm: number) =>
      adapter.resolve({ ...draft, pizzaType, sizeCm }).pizzaWeight;

    expect(weightOf(PizzaType.NEAPOLITAN, 26)).toBe(220);
    expect(weightOf(PizzaType.NEAPOLITAN, 35)).toBe(340);
    expect(weightOf(PizzaType.ROMAN, 26)).toBe(130);
    expect(weightOf(PizzaType.ROMAN, 33)).toBe(210);
  });

  it('brings a size inherited from another style back into range', () => {
    // A 35 cm Neapolitan answered, then the style switched to Roman.
    expect(
      adapter.resolve({ ...draft, pizzaType: PizzaType.ROMAN, sizeCm: 35 })
        .pizzaWeight,
    ).toBe(210);
  });

  it('always applies W270 — this path never asks for the flour', () => {
    expect(adapter.resolve(draft).flourStrength).toBe(270);

    defaults.update({ flourStrength: 350 });

    expect(adapter.resolve(draft).flourStrength).toBe(270);
  });

  it('pins the salt independently of the user Defaults', () => {
    defaults.update({ saltRatio: 0.04 });

    expect(adapter.resolve(draft).saltRatio).toBe(0.028);
  });

  it('adds no honey, whatever the Defaults hold', () => {
    defaults.update({ honeyRatio: 0.005 });

    expect(adapter.resolve(draft).honeyRatio).toBe(0);
    expect(
      adapter.resolve({ ...draft, pizzaType: PizzaType.ROMAN }).honeyRatio,
    ).toBe(0);
  });

  it('leaves the olive oil to the style and the hydration to the engine', () => {
    const input = adapter.resolve(draft);

    expect(input.oliveOilRatio).toBeNull();
    expect(input.hydrationRatio).toBeNull();
  });

  it('hands the engine a total rest with no pre-computed split', () => {
    const input = adapter.resolve(draft);

    expect(input.globalRestTime).toBe(36);
    expect(input.rtRestTime).toBeNull();
    expect(input.coldRestTime).toBeNull();
  });

  it('carries every remaining answer through untouched', () => {
    expect(adapter.resolve(draft)).toEqual(
      jasmine.objectContaining({
        pizzaType: PizzaType.NEAPOLITAN,
        nbPizzas: 6,
        doughType: DoughType.DIRECT,
        temperature: 22,
        yeastType: YeastType.FRESH,
      }),
    );
  });

  it('takes the unexposed poolish ratio from the Defaults', () => {
    expect(adapter.resolve(draft).poolishRatio).toBe(0.4);
  });
});
