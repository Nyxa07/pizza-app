/**
 * Which inputs the engine treats as auto (recomputed or defaulted) for the
 * active calculator path. The per-field `visible` flag died with the
 * field-visibility screen (issue #71, ADR-0002): the Expert screen shows a
 * fixed structure and the Guided path owns its own steps.
 */
export interface ICalculatorSettings {
  pizzaWeight: { auto: boolean };
  saltRatio: { auto: boolean };
  honeyRatio: { auto: boolean };
  flourStrength: { auto: boolean };
  hydrationRatio: { auto: boolean };
  doughType: { auto: boolean };
  poolishRatio: { auto: boolean };
  yeastType: { auto: boolean };
  temperature: { auto: boolean };
  globalRestTime: { auto: boolean };
  rtRestTime: { auto: boolean };
  coldRestTime: { auto: boolean };
  oliveOilRatio: { auto: boolean };
}
