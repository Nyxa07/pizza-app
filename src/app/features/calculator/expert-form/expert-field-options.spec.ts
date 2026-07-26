import {
  EXPERT_FIELD_OPTIONS,
  restTimePatch,
  stepInList,
} from './expert-field-options';

describe('EXPERT_FIELD_OPTIONS', () => {
  it('keeps the historic bounds of every steppable field', () => {
    const bounds = (values: readonly number[]) => [
      values[0],
      values[values.length - 1],
    ];

    expect(bounds(EXPERT_FIELD_OPTIONS.nbPizzas)).toEqual([1, 25]);
    expect(bounds(EXPERT_FIELD_OPTIONS.hydrationRatio)).toEqual([0.55, 0.8]);
    expect(bounds(EXPERT_FIELD_OPTIONS.poolishRatio)).toEqual([0.3, 0.6]);
    expect(bounds(EXPERT_FIELD_OPTIONS.saltRatio)).toEqual([0.02, 0.04]);
    expect(bounds(EXPERT_FIELD_OPTIONS.honeyRatio)).toEqual([0, 0.005]);
    expect(bounds(EXPERT_FIELD_OPTIONS.oliveOilRatio)).toEqual([0, 0.03]);
    expect(bounds(EXPERT_FIELD_OPTIONS.flourStrength)).toEqual([200, 400]);
    expect(bounds(EXPERT_FIELD_OPTIONS.temperature)).toEqual([19, 36]);
    expect(bounds(EXPERT_FIELD_OPTIONS.rtRestTime)).toEqual([1, 24]);
    expect(bounds(EXPERT_FIELD_OPTIONS.coldRestTime)).toEqual([0, 48]);
  });

  it('leaves the ball weight grid to the pizza format model', () => {
    // It is the one grid that depends on the current style, so it cannot be
    // a static constant shared by Expert and « Mes pâtes par défaut ».
    expect('pizzaWeight' in EXPERT_FIELD_OPTIONS).toBeFalse();
  });

  it('steps ratios on exact select-style values (no floating drift)', () => {
    expect(EXPERT_FIELD_OPTIONS.hydrationRatio).toContain(0.62);
    expect(EXPERT_FIELD_OPTIONS.saltRatio).toContain(0.028);
    expect(EXPERT_FIELD_OPTIONS.honeyRatio).toContain(0.004);
  });
});

describe('stepInList', () => {
  const values = [10, 20, 30, 40];

  it('moves to the next value up or down', () => {
    expect(stepInList(values, 20, 1)).toBe(30);
    expect(stepInList(values, 20, -1)).toBe(10);
  });

  it('clamps at both bounds', () => {
    expect(stepInList(values, 40, 1)).toBe(40);
    expect(stepInList(values, 10, -1)).toBe(10);
  });

  it('snaps a value that is not in the list to the nearest step in the direction', () => {
    // A Draft coming from another path may hold values off the expert grid.
    expect(stepInList(values, 25, 1)).toBe(30);
    expect(stepInList(values, 25, -1)).toBe(20);
  });

  it('clamps an out-of-range value back into the list', () => {
    expect(stepInList(values, 5, -1)).toBe(10);
    expect(stepInList(values, 55, 1)).toBe(40);
  });
});

describe('restTimePatch', () => {
  const effective = { rtRestTime: 16, coldRestTime: 8 };

  it('materialises both effective rest times and drops globalRestTime', () => {
    // The Draft may come from the Guided path where only globalRestTime is
    // set; editing one rest tile must pin BOTH effective values, otherwise
    // the engine would keep re-splitting the global rest.
    expect(restTimePatch('rtRestTime', 17, effective)).toEqual({
      rtRestTime: 17,
      coldRestTime: 8,
      globalRestTime: null,
    });
  });

  it('patches the cold rest symmetrically', () => {
    expect(restTimePatch('coldRestTime', 12, effective)).toEqual({
      rtRestTime: 16,
      coldRestTime: 12,
      globalRestTime: null,
    });
  });
});
