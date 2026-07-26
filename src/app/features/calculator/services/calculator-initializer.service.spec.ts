import { TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { CalculatorPath } from '../enums/calculator-path.enum';
import { CalculatorInitializerService } from './calculator-initializer.service';
import { ExpertDraftService } from './expert-draft.service';
import { GuidedDraftService } from './guided-draft.service';
import { IntermediateDraftService } from './intermediate-draft.service';

/**
 * The registry of calculator paths: each path resumes and resets its own
 * Draft, and no path ever copies another's values (ADR-0003).
 */
describe('CalculatorInitializerService', () => {
  const paths = Object.values(CalculatorPath);

  describe('as the single seam over every path', () => {
    let service: CalculatorInitializerService;
    let expert: ExpertDraftService;
    let guided: GuidedDraftService;
    let intermediate: IntermediateDraftService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: PrefsStorage, useValue: new FakePrefsStorage() },
        ],
      });
      service = TestBed.inject(CalculatorInitializerService);
      expert = TestBed.inject(ExpertDraftService);
      guided = TestBed.inject(GuidedDraftService);
      intermediate = TestBed.inject(IntermediateDraftService);
      for (const path of paths) {
        service.init(path);
      }
    });

    it('registers all three paths', () => {
      expect(paths).toEqual([
        CalculatorPath.GUIDED,
        CalculatorPath.INTERMEDIATE,
        CalculatorPath.EXPERT,
      ]);
    });

    for (const path of paths) {
      it(`resolves a complete engine input and its settings for ${path}`, async () => {
        const input = await firstValueFrom(service.resolvedInput$(path));

        expect(input.nbPizzas).toBeGreaterThan(0);
        expect(input.pizzaType).toBe(PizzaType.NEAPOLITAN);
        expect(service.settingsFor(path)).toBeTruthy();
      });
    }

    it('starts over only the requested path', () => {
      expert.update({ nbPizzas: 12 });
      guided.update({ nbPizzas: 9 });
      intermediate.update({ nbPizzas: 7 });

      service.newCalculation(CalculatorPath.INTERMEDIATE);

      expect(intermediate.getDraft().nbPizzas).toBe(5);
      expect(expert.getInput().nbPizzas).toBe(12);
      expect(guided.getDraft().nbPizzas).toBe(9);
    });

    it('never lets one path leak values into another', () => {
      expert.update({
        pizzaType: PizzaType.ROMAN,
        nbPizzas: 12,
        flourStrength: 350,
        hydrationRatio: 0.71,
      });

      expect(intermediate.getDraft().pizzaType).toBe(PizzaType.NEAPOLITAN);
      expect(intermediate.getDraft().nbPizzas).toBe(5);
      expect(guided.getDraft().pizzaType).toBe(PizzaType.NEAPOLITAN);
    });
  });

  describe('initialisation routing', () => {
    let expert: jasmine.SpyObj<ExpertDraftService>;
    let guided: jasmine.SpyObj<GuidedDraftService>;
    let intermediate: jasmine.SpyObj<IntermediateDraftService>;
    let service: CalculatorInitializerService;

    beforeEach(() => {
      expert = jasmine.createSpyObj<ExpertDraftService>('ExpertDraftService', [
        'init',
      ]);
      guided = jasmine.createSpyObj<GuidedDraftService>('GuidedDraftService', [
        'init',
      ]);
      intermediate = jasmine.createSpyObj<IntermediateDraftService>(
        'IntermediateDraftService',
        ['init'],
      );
      TestBed.configureTestingModule({
        providers: [
          { provide: ExpertDraftService, useValue: expert },
          { provide: GuidedDraftService, useValue: guided },
          { provide: IntermediateDraftService, useValue: intermediate },
        ],
      });
      service = TestBed.inject(CalculatorInitializerService);
    });

    it('initializes only the Draft requested by a Method route', () => {
      service.init(CalculatorPath.GUIDED);

      expect(guided.init).toHaveBeenCalledTimes(1);
      expect(expert.init).not.toHaveBeenCalled();
      expect(intermediate.init).not.toHaveBeenCalled();

      service.init(CalculatorPath.INTERMEDIATE);

      expect(intermediate.init).toHaveBeenCalledTimes(1);
      expect(expert.init).not.toHaveBeenCalled();

      service.init(CalculatorPath.EXPERT);

      expect(expert.init).toHaveBeenCalledTimes(1);
      expect(guided.init).toHaveBeenCalledTimes(1);
    });
  });
});
