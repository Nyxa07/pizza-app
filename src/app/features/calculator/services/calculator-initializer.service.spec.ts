import { TestBed } from '@angular/core/testing';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { CalculatorInitializerService } from './calculator-initializer.service';
import { ExpertDraftService } from './expert-draft.service';
import { GuidedDraftService } from './guided-draft.service';

describe('CalculatorInitializerService', () => {
  let expert: jasmine.SpyObj<ExpertDraftService>;
  let guided: jasmine.SpyObj<GuidedDraftService>;
  let service: CalculatorInitializerService;

  beforeEach(() => {
    expert = jasmine.createSpyObj<ExpertDraftService>('ExpertDraftService', [
      'init',
    ]);
    guided = jasmine.createSpyObj<GuidedDraftService>('GuidedDraftService', [
      'init',
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: ExpertDraftService, useValue: expert },
        { provide: GuidedDraftService, useValue: guided },
      ],
    });
    service = TestBed.inject(CalculatorInitializerService);
  });

  it('initializes only the Draft requested by a Method route', () => {
    service.initMethod(CalculatorPath.GUIDED);

    expect(guided.init).toHaveBeenCalledTimes(1);
    expect(expert.init).not.toHaveBeenCalled();

    service.initMethod(CalculatorPath.EXPERT);

    expect(expert.init).toHaveBeenCalledTimes(1);
    expect(guided.init).toHaveBeenCalledTimes(1);
  });
});
