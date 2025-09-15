import { Injectable } from '@angular/core';
import { IPreProcessor } from '../../interfaces/pre-processor.interface';
import { DEFAULT_INPUTS } from '../calculator-state.service';
import { DoughType } from '../../enums/dough-type.enum';
import { YeastType } from '../../enums/yeast-type.enum';
import { ICalculatorSettings } from '../../interfaces/calculator-settings.interface';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';

@Injectable({
  providedIn: 'root',
})
export class FillMissingPreProcessor implements IPreProcessor {
  process(
    settings: ICalculatorSettings,
    input: ICalculatorInput,
  ): ICalculatorInput {
    const pizzaType = input.pizzaType;
    const defaultInput = DEFAULT_INPUTS[pizzaType];
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
      pizzaWeight: settings.pizzaWeight.auto
        ? defaultInput.pizzaWeight
        : input.pizzaWeight,

      oliveOilRatio: settings.oliveOilRatio.auto
        ? defaultInput.oliveOilRatio
        : input.oliveOilRatio,
    };
  }
}
