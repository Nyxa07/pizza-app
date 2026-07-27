import { Injectable, inject } from '@angular/core';

import { map, Observable, shareReplay } from 'rxjs';

import { ProcessorPipeline } from './processors/processor-pipeline';
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
  /**
   * The steps the engine is made of, as a set: each one declares the output
   * fields it reads and the ones it writes, and the pipeline derives the
   * running order from those declarations. Nothing here is an order — moving
   * a line changes nothing, and a step that read what no other step writes
   * would throw at the first injection.
   */
  private readonly pipeline = new ProcessorPipeline([
    inject(PizzaBallsWeightProcessor),
    inject(HydrationProcessor),
    inject(FlourWaterQuantityProcessor),
    inject(SimpleIngredientsProcessor),
    inject(PizzaBallsRestTimeProcessor),
    inject(TimingsProcessor),
    inject(YeastProcessor),
  ]);

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
    return this.pipeline.run(input);
  }
}
