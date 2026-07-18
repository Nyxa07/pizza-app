/**
 * User appearance preference: follow the system scheme or force one.
 * The visual identity itself is unique (ADR-0001) — this only selects
 * its light or dark rendering.
 */
export enum Appearance {
  System = 'system',
  Light = 'light',
  Dark = 'dark',
}
