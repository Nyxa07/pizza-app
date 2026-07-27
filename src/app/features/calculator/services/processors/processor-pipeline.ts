import type { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import type { ICalculatorOutput } from '../../interfaces/calculator-output.interface';
import { OUTPUT_FIELDS, readField, writeField } from './output-field';
import type { OutputField } from './output-field';
import type { AnyProcessor } from './processor.interface';

/**
 * The engine's processors, ordered by what they declare and run in that
 * order.
 *
 * Nothing here knows what any single processor computes. It knows that a step
 * reading `total.flour` runs after the step writing it, and that between them
 * the steps cover the whole output — both checked once, when the pipeline is
 * built. An unwritable read, a field written twice, a cycle or a gap in the
 * output throws there, at the first injection, rather than reaching a screen
 * as `undefined`.
 *
 * The order being derived, the list handed to the constructor is a set: no
 * arrangement of it can be wrong, and none can be relied on.
 */
export class ProcessorPipeline {
  private readonly ordered: readonly AnyProcessor[];

  constructor(processors: readonly AnyProcessor[]) {
    this.ordered = orderByDependencies(processors);
  }

  run(input: ICalculatorInput): ICalculatorOutput {
    const output: Record<string, unknown> = {};

    for (const processor of this.ordered) {
      const produced = processor.process(
        input,
        sliceOf(output, processor.reads),
      );

      for (const field of processor.writes) {
        const value = readField(produced, field);
        if (value === undefined) {
          throw new Error(
            `A processor declares it writes "${field}" but did not produce it.`,
          );
        }
        writeField(output, field, value);
      }
    }

    // Complete by construction: the ordering checked that every field of the
    // output has a step writing it, and the loop above refuses a step that
    // does not produce what it declared.
    return output as unknown as ICalculatorOutput;
  }
}

/**
 * The running order the declarations amount to, and the four ways they can
 * fail to amount to one.
 */
function orderByDependencies(
  processors: readonly AnyProcessor[],
): readonly AnyProcessor[] {
  const author = new Map<OutputField, AnyProcessor>();
  for (const processor of processors) {
    for (const field of processor.writes) {
      if (author.has(field)) {
        throw new Error(
          `Two processors write "${field}"; a field of the engine output has exactly one author.`,
        );
      }
      author.set(field, processor);
    }
  }

  const dependencies = new Map<AnyProcessor, readonly AnyProcessor[]>();
  for (const processor of processors) {
    dependencies.set(
      processor,
      processor.reads.map((field) => {
        const writer = author.get(field);
        if (!writer) {
          throw new Error(`No processor writes "${field}", read by another.`);
        }
        if (writer === processor) {
          throw new Error(
            `A processor reads "${field}", which it writes itself.`,
          );
        }
        return writer;
      }),
    );
  }

  for (const field of OUTPUT_FIELDS) {
    if (!author.has(field)) {
      throw new Error(
        `No processor writes "${field}"; the engine cannot return a complete output.`,
      );
    }
  }

  const ordered: AnyProcessor[] = [];
  const placed = new Set<AnyProcessor>();
  let remaining = [...processors];

  while (remaining.length > 0) {
    // Steps whose every dependency is already placed. They tie only when
    // neither reads what the other writes, so their relative order cannot
    // change the output; the order they were declared in settles it, which
    // keeps the derived order stable from one build to the next.
    const ready = remaining.filter((processor) =>
      (dependencies.get(processor) ?? []).every((dependency) =>
        placed.has(dependency),
      ),
    );

    if (ready.length === 0) {
      throw new Error(
        `A cycle leaves these processors waiting on each other: ${remaining
          .map((processor) => processor.writes.join(', '))
          .join(' / ')}.`,
      );
    }

    for (const processor of ready) {
      ordered.push(processor);
      placed.add(processor);
    }
    remaining = remaining.filter((processor) => !placed.has(processor));
  }

  return ordered;
}

/** What a step is handed: the fields it declared, and nothing else. */
function sliceOf(
  output: Record<string, unknown>,
  fields: readonly OutputField[],
): Record<string, unknown> {
  const slice: Record<string, unknown> = {};
  for (const field of fields) {
    writeField(slice, field, readField(output, field));
  }
  return slice;
}
