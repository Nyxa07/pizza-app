import { TestBed } from '@angular/core/testing';

import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';

import { CalculatorGuidedPage } from './guided.page';

/**
 * Symmetric to the Expert page (issue #79): the Guided page re-asserts its
 * engine settings on *every* view entry, so the `auto` map always matches the
 * visible path even when Ionic re-shows the cached page without `ngOnInit`.
 */
describe('CalculatorGuidedPage', () => {
  let initializer: jasmine.SpyObj<CalculatorInitializerService>;
  let originalRequestIdleCallback: typeof window.requestIdleCallback;

  const createPage = (): CalculatorGuidedPage =>
    TestBed.runInInjectionContext(() => new CalculatorGuidedPage());

  beforeEach(() => {
    // idleCallback() defers through requestIdleCallback — run it synchronously
    // so the assertions do not hinge on idle scheduling.
    originalRequestIdleCallback = window.requestIdleCallback;
    window.requestIdleCallback = ((cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline);
      return 0;
    }) as typeof window.requestIdleCallback;

    initializer = jasmine.createSpyObj<CalculatorInitializerService>(
      'CalculatorInitializerService',
      ['initGuided'],
    );

    TestBed.configureTestingModule({
      providers: [
        { provide: CalculatorInitializerService, useValue: initializer },
      ],
    });
  });

  afterEach(() => {
    window.requestIdleCallback = originalRequestIdleCallback;
  });

  it('applies the Guided settings when the view is entered', () => {
    createPage().ionViewWillEnter();

    expect(initializer.initGuided).toHaveBeenCalledTimes(1);
  });

  it('re-applies the Guided settings on every re-entry (issue #79)', () => {
    const page = createPage();

    page.ionViewWillEnter();
    page.ionViewWillEnter();

    expect(initializer.initGuided).toHaveBeenCalledTimes(2);
  });
});
