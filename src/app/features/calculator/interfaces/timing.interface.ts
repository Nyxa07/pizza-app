export interface ITimingPart {
  coldRestTime: number;
  rtRestTime: number;
  prepTime: number;
}

export interface ITimings {
  poolish: ITimingPart;
  dough: ITimingPart;
  pizzaBalls: ITimingPart;
  total: ITimingPart;
}
