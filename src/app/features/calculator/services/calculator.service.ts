import { Injectable, inject } from '@angular/core';

import { map, Observable, shareReplay } from 'rxjs';

import { runProcessors } from './processors/run-processors';
import { HydrationProcessor } from './processors/hydration.processor';
import { YeastProcessor } from './processors/yeast.processor';
import { TimingsProcessor } from './processors/timings.processor';
import { SimpleIngredientsProcessor } from './processors/simple-ingredients.processort';
import { FlourWaterQuantityProcessor } from './processors/flour-water-quantity.processor';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { PizzaBallsRestTimeProcessor } from './processors/pizza-balls-rest-time.processor';
import { PizzaBallsWeightProcessor } from './processors/pizza-balls-weight.processor';

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
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

  resultsFor$(
    input$: Observable<ICalculatorInput>,
  ): Observable<ICalculatorOutput> {
    return input$.pipe(
      map((input) => this.process(input)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /**
   * A `null` input field is a request to derive addressed to the processors;
   * every other value is used as given. Nothing else decides what the engine
   * computes for itself.
   */
  process(input: ICalculatorInput): ICalculatorOutput {
    const output = runProcessors(input, [
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
