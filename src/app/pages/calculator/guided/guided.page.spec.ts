import { TestBed } from '@angular/core/testing';

import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';

import { CalculatorGuidedPage } from './guided.page';

/**
 * The Guided page reloads its own Draft on every view entry because Ionic
 * caches pages in the router-outlet stack.
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
      ['init'],
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

  it('initializes the Guided Draft when the view is entered', () => {
    createPage().ionViewWillEnter();

    expect(initializer.init).toHaveBeenCalledTimes(1);
  });

  it('reloads the Guided Draft on every re-entry', () => {
    const page = createPage();

    page.ionViewWillEnter();
    page.ionViewWillEnter();

    expect(initializer.init).toHaveBeenCalledTimes(2);
  });
});
