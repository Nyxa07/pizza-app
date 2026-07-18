import { collectKeys } from 'src/app/shared/testing/collect-keys';
import enCalculator from 'src/assets/i18n/en/calculator.json';
import enCommon from 'src/assets/i18n/en/common.json';
import enPages from 'src/assets/i18n/en/pages.json';
import enSettings from 'src/assets/i18n/en/settings.json';
import frCalculator from 'src/assets/i18n/fr/calculator.json';
import frCommon from 'src/assets/i18n/fr/common.json';
import frPages from 'src/assets/i18n/fr/pages.json';
import frSettings from 'src/assets/i18n/fr/settings.json';

/**
 * Every translation key must exist in both shipped languages (issue #67):
 * a key missing on one side shows up as raw text in that language.
 */
describe('i18n catalogs (FR + EN)', () => {
  const domains = [
    { name: 'calculator', en: enCalculator, fr: frCalculator },
    { name: 'common', en: enCommon, fr: frCommon },
    { name: 'pages', en: enPages, fr: frPages },
    { name: 'settings', en: enSettings, fr: frSettings },
  ];

  for (const { name, en, fr } of domains) {
    it(`ships the same keys in English and French for "${name}"`, () => {
      expect(collectKeys(fr).sort()).toEqual(collectKeys(en).sort());
    });
  }
});
