/**
 * Flattens a translation catalog into its dotted key paths; array entries
 * count as keys too, so a missing list item breaks parity as well.
 */
export const collectKeys = (
  node: Record<string, unknown>,
  prefix = '',
): string[] =>
  Object.entries(node).reduce<string[]>(
    (keys, [key, value]) =>
      typeof value === 'object' && value !== null
        ? keys.concat(
            collectKeys(value as Record<string, unknown>, `${prefix}${key}.`),
          )
        : keys.concat(`${prefix}${key}`),
    [],
  );
