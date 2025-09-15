import {
  IProcessor,
  PartialCalculatorOutput,
} from '../../interfaces/processor.interface';

/**
 * Helper to run a list of processors sequentially.
 * Each processor can read the immutable `input` object and the cumulative
 * `acc` output built so far. It must return an *additional* partial output.
 *
 * The helper merges every partial output **deeply** to build the final result.
 * Objects are merged recursively; primitive values and arrays are overwritten by the most
 * recent processor's output.
 */
export function runProcessors<Input>(
  input: Input,
  processors: IProcessor[],
): PartialCalculatorOutput {
  const isObject = (val: unknown): val is Record<string, any> =>
    val !== null && typeof val === 'object' && !Array.isArray(val);

  const deepMerge = (
    target: PartialCalculatorOutput,
    source: PartialCalculatorOutput,
  ): PartialCalculatorOutput => {
    const result: PartialCalculatorOutput = { ...target };
    for (const key of Object.keys(source)) {
      const srcVal = (source as any)[key];
      const tgtVal = (result as any)[key];
      if (isObject(srcVal) && isObject(tgtVal)) {
        (result as any)[key] = deepMerge(tgtVal, srcVal);
      } else {
        (result as any)[key] = srcVal;
      }
    }
    return result;
  };

  return processors.reduce<PartialCalculatorOutput>((acc, processor) => {
    const next = processor.process(input as any, acc);
    return deepMerge(acc, next);
  }, {} as PartialCalculatorOutput);
}
