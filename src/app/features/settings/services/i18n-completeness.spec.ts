import enCalculator from 'src/assets/i18n/en/calculator.json';
import enCommon from 'src/assets/i18n/en/common.json';
import enFaq from 'src/assets/i18n/en/faq.json';
import enPages from 'src/assets/i18n/en/pages.json';
import enSettings from 'src/assets/i18n/en/settings.json';
import frCalculator from 'src/assets/i18n/fr/calculator.json';
import frCommon from 'src/assets/i18n/fr/common.json';
import frFaq from 'src/assets/i18n/fr/faq.json';
import frPages from 'src/assets/i18n/fr/pages.json';
import frSettings from 'src/assets/i18n/fr/settings.json';

/**
 * Flattens a translation catalog into its dotted key paths; array entries
 * count as keys too, so a missing list item breaks parity as well.
 */
const collectKeys = (node: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(node).reduce<string[]>(
    (keys, [key, value]) =>
      typeof value === 'object' && value !== null
        ? keys.concat(
            collectKeys(value as Record<string, unknown>, `${prefix}${key}.`),
          )
        : keys.concat(`${prefix}${key}`),
    [],
  );

/**
 * Every translation key must exist in both shipped languages (issue #67):
 * a key missing on one side shows up as raw text in that language.
 */
describe('i18n catalogs (FR + EN)', () => {
  const domains = [
    { name: 'calculator', en: enCalculator, fr: frCalculator },
    { name: 'common', en: enCommon, fr: frCommon },
    { name: 'faq', en: enFaq, fr: frFaq },
    { name: 'pages', en: enPages, fr: frPages },
    { name: 'settings', en: enSettings, fr: frSettings },
  ];

  for (const { name, en, fr } of domains) {
    it(`ships the same keys in English and French for "${name}"`, () => {
      expect(collectKeys(fr).sort()).toEqual(collectKeys(en).sort());
    });
  }
});
