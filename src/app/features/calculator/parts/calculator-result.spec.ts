import type {
  ICalculatorOutput,
  Quantity,
} from '../interfaces/calculator-output.interface';
import { summarizeOutput } from './calculator-result';

const quantity = (overrides: Partial<Quantity> = {}): Quantity => ({
  flour: 0,
  water: 0,
  yeast: 0,
  salt: 0,
  honey: 0,
  oliveOil: 0,
  rtRestTime: 0,
  coldRestTime: 0,
  prepTime: 0,
  ...overrides,
});

const makeOutput = (
  totalOverrides: Partial<Quantity> = {},
): ICalculatorOutput => ({
  total: quantity({
    flour: 755.3,
    water: 468.1,
    yeast: 2.1449,
    salt: 21.4,
    honey: 3.05,
    oliveOil: 12.2,
    ...totalOverrides,
  }),
  poolish: quantity({ rtRestTime: 16, coldRestTime: 8 }),
  dough: quantity({ rtRestTime: 8, coldRestTime: 0 }),
  pizzaBalls: { weight: 249.6, rtRestTime: 2, coldRestTime: 0, prepTime: 2 },
  hydrationRatio: 0.6199,
});

describe('summarizeOutput', () => {
  it('splits the dough with the yeast at the centigram, the rest at the gram', () => {
    const result = summarizeOutput(makeOutput(), false);

    expect(result.split).toEqual({
      flour: 755,
      water: 468,
      salt: 21,
      yeast: 2.14,
    });
  });

  it('never rounds a real pinch of yeast down to nothing', () => {
    const result = summarizeOutput(makeOutput({ yeast: 0.004 }), false);

    expect(result.split.yeast).toBe(0.01);
  });

  it('totals every ingredient to the whole gram', () => {
    const result = summarizeOutput(makeOutput(), false);

    // 755.3 + 468.1 + 21.4 + 2.1449 + 3.05 + 12.2
    expect(result.total).toBe(1262);
  });

  it('reads the rest off the poolish when the dough carries one', () => {
    const result = summarizeOutput(makeOutput(), true);

    expect(result.ambientHours).toBe(16);
    expect(result.coldHours).toBe(8);
  });

  it('reads the rest off the dough itself when it is direct', () => {
    const result = summarizeOutput(makeOutput(), false);

    expect(result.ambientHours).toBe(8);
    expect(result.coldHours).toBe(0);
  });

  it('rounds the ball weight and the hydration for the screens', () => {
    const result = summarizeOutput(makeOutput(), false);

    expect(result.weight).toBe(250);
    expect(result.hydrationPct).toBe(62);
  });
});
