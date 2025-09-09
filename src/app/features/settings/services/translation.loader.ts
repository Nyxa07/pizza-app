import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Provider } from '@angular/core';
import { TranslationObject } from '@ngx-translate/core';

const domains = ['common', 'pages', 'calculator', 'faq', 'settings'];
/**
 * Custom loader able to merge several domain-specific JSON files per language
 * located under `assets/i18n/<lang>/<domain>.json`.
 */
export class MultiFolderTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private basePath: string = '/assets/i18n/',
    private suffix: string = '.json',
    private domains: string[] = domains,
  ) {}

  /**
   * Loads all configured domain files for the given language and merges them.
   */
  getTranslation(lang: string): Observable<TranslationObject> {
    const requests = this.domains.map((domain) =>
      this.http
        .get<TranslationObject>(
          `${this.basePath}${lang}/${domain}${this.suffix}`,
        )
        .pipe(
          map((content) => ({ [domain]: content }) as TranslationObject),
          catchError(() => of({} as TranslationObject)),
        ),
    );

    return forkJoin(requests).pipe(
      map((partialTranslations) =>
        partialTranslations.reduce<TranslationObject>(
          (acc, current) => ({ ...acc, ...current }),
          {} as TranslationObject,
        ),
      ),
    );
  }
}

/**
 * Factory helper so we can keep the same API as `provideTranslateHttpLoader`.
 */
export function provideMultiTranslateLoader(config?: {
  domains?: string[];
  basePath?: string;
  suffix?: string;
}): Provider {
  return {
    provide: TranslateLoader,
    useFactory: (http: HttpClient) =>
      new MultiFolderTranslateLoader(
        http,
        config?.basePath ?? '/assets/i18n/',
        config?.suffix ?? '.json',
        config?.domains ?? domains,
      ),
    deps: [HttpClient],
  };
}
