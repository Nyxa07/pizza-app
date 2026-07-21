import { Injectable, inject } from '@angular/core';
import { CalculatorStateService } from './calculator-state.service';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';
import { runProcessors } from './processors/run-processors';
import { FillMissingPreProcessor } from './processors/transform-input.pre-processor';
import { HydrationProcessor } from './processors/hydration.processor';
import { YeastProcessor } from './processors/yeast.processor';
import { TimingsProcessor } from './processors/timings.processor';
import { SimpleIngredientsProcessor } from './processors/simple-ingredients.processort';
import { FlourWaterQuantityProcessor } from './processors/flour-water-quantity.processor';
import { CalculatorSettingsService } from './calculator-settings.service';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { ICalculatorSettings } from '../interfaces/calculator-settings.interface';
import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { PizzaBallsRestTimeProcessor } from './processors/pizza-balls-rest-time.processor';
import { PizzaBallsWeightProcessor } from './processors/pizza-balls-weight.processor';

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  private readonly settings = inject(CalculatorSettingsService);
  private readonly state = inject(CalculatorStateService);
  private readonly fillMissingPreProcessor = inject(FillMissingPreProcessor);
  private readonly pizzaBallsWeightProcessor = inject(
    PizzaBallsWeightProcessor,
  );
  private readonly hydrationProcessor = inject(HydrationProcessor);
  private readonly flourWaterQuantityProcessor = inject(
    FlourWaterQuantityProcessor,
  );
  private readonly simpleIngredientsProcessor = inject(
    SimpleIngredientsProcessor,
  );
  private readonly ballsRestTimeProcessor = inject(PizzaBallsRestTimeProcessor);
  private readonly timingsProcessor = inject(TimingsProcessor);
  private readonly yeastProcessor = inject(YeastProcessor);

  readonly results$: Observable<ICalculatorOutput> = combineLatest([
    this.settings.getSettings$(),
    this.state.getInput$(),
  ]).pipe(
    map(([settings, input]) => this.process(settings, input)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  process(
    settings: ICalculatorSettings,
    input: ICalculatorInput,
  ): ICalculatorOutput {
    const processedInput = this.fillMissingPreProcessor.process(
      settings,
      input,
    );

    const output = runProcessors(processedInput, [
      this.pizzaBallsWeightProcessor,
      this.hydrationProcessor,
      this.flourWaterQuantityProcessor,
      this.simpleIngredientsProcessor,
      this.ballsRestTimeProcessor,
      this.timingsProcessor,
      this.yeastProcessor,
    ]);

    return output as ICalculatorOutput;
  }
}
