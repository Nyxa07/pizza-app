import { Injectable } from '@angular/core';
import { CalculatorStateService } from './calculator-state.service';
import { combineLatest, filter, map, Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  results$: Observable<ICalculatorOutput> = combineLatest([
    this.settings.getSettings$(),
    this.state.getInput$(),
  ]).pipe(map(([settings, input]) => this.process(settings, input)));

  constructor(
    private settings: CalculatorSettingsService,
    private state: CalculatorStateService,
    private fillMissingPreProcessor: FillMissingPreProcessor,
    private hydrationProcessor: HydrationProcessor,
    private flourWaterQuantityProcessor: FlourWaterQuantityProcessor,
    private simpleIngredientsProcessor: SimpleIngredientsProcessor,
    private ballsRestTimeProcessor: PizzaBallsRestTimeProcessor,
    private timingsProcessor: TimingsProcessor,
    private yeastProcessor: YeastProcessor,
  ) {}

  process(
    settings: ICalculatorSettings,
    input: ICalculatorInput,
  ): ICalculatorOutput {
    const processedInput = this.fillMissingPreProcessor.process(
      settings,
      input,
    );

    const output = runProcessors(processedInput, [
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
