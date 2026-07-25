import { TestBed } from '@angular/core/testing';

import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';

import { CalculatorExpertPage } from './expert.page';

/**
 * The Expert page reloads its own Draft on every view entry because Ionic
 * caches pages in the router-outlet stack.
 */
describe('CalculatorExpertPage', () => {
  let initializer: jasmine.SpyObj<CalculatorInitializerService>;
  let originalRequestIdleCallback: typeof window.requestIdleCallback;

  const createPage = (): CalculatorExpertPage =>
    TestBed.runInInjectionContext(() => new CalculatorExpertPage());

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
      ['initExpert'],
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

  it('initializes the Expert Draft when the view is entered', () => {
    createPage().ionViewWillEnter();

    expect(initializer.initExpert).toHaveBeenCalledTimes(1);
  });

  it('reloads the Expert Draft on every re-entry', () => {
    const page = createPage();

    page.ionViewWillEnter();
    page.ionViewWillEnter();

    expect(initializer.initExpert).toHaveBeenCalledTimes(2);
  });
});
