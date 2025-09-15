import { Injectable } from '@angular/core';
import { IPreProcessor } from '../../interfaces/pre-processor.interface';
import { DoughType } from '../../enums/dough-type.enum';
import { YeastType } from '../../enums/yeast-type.enum';
import { ICalculatorSettings } from '../../interfaces/calculator-settings.interface';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { DEFAULT_INPUT } from '../calculator-initializer.service';

@Injectable({
  providedIn: 'root',
})
export class FillMissingPreProcessor implements IPreProcessor {
  process(
    settings: ICalculatorSettings,
    input: ICalculatorInput,
  ): ICalculatorInput {
    const defaultInput = DEFAULT_INPUT;
    return {
      nbPizzas: input.nbPizzas,
      pizzaType: input.pizzaType,
      temperature: input.temperature,
      globalRestTime: settings.globalRestTime.auto
        ? null
        : input.globalRestTime,
      rtRestTime: settings.rtRestTime.auto ? null : input.rtRestTime,
      coldRestTime: settings.coldRestTime.auto ? null : input.coldRestTime,
      doughType: settings.doughType.auto ? DoughType.DIRECT : input.doughType,
      yeastType: settings.yeastType.auto
        ? YeastType.DRY_ACTIVE
        : input.yeastType,
      hydrationRatio: settings.hydrationRatio.auto
        ? null
        : input.hydrationRatio,
      poolishRatio: settings.poolishRatio.auto
        ? defaultInput.poolishRatio
        : input.poolishRatio,
      flourStrength: settings.flourStrength.auto
        ? defaultInput.flourStrength
        : input.flourStrength,
      saltRatio: settings.saltRatio.auto
        ? defaultInput.saltRatio
        : input.saltRatio,
      honeyRatio: settings.honeyRatio.auto
        ? defaultInput.honeyRatio
        : input.honeyRatio,
      pizzaWeight: settings.pizzaWeight.auto ? null : input.pizzaWeight,

      oliveOilRatio: settings.oliveOilRatio.auto ? null : input.oliveOilRatio,
    };
  }
}
