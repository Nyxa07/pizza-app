import type { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { OUTPUT_FIELDS, writeField } from './output-field';
import type { OutputField } from './output-field';
import { ProcessorPipeline } from './processor-pipeline';
import type { AnyProcessor } from './processor.interface';

/**
 * The pipeline knows nothing of dough: it orders steps by what they declare
 * and refuses the declarations that do not amount to an order. Fake steps say
 * that better than the real ones, whose dependencies are already correct.
 */
describe('ProcessorPipeline', () => {
  const NO_INPUT = {} as ICalculatorInput;

  let ran: string[];
  let seen: Record<string, Record<string, unknown>>;

  beforeEach(() => {
    ran = [];
    seen = {};
  });

  const step = (
    name: string,
    reads: readonly OutputField[],
    writes: readonly OutputField[],
  ): AnyProcessor => ({
    reads,
    writes,
    process: (_input, acc) => {
      ran.push(name);
      seen[name] = acc;
      return fragmentOf(writes);
    },
  });

  /**
   * The steps under test, completed by one covering every field they leave
   * out — so what fails is the declaration the test is about, never the
   * pipeline's demand for a complete output.
   */
  const completed = (steps: readonly AnyProcessor[]): AnyProcessor[] => {
    const written = steps.flatMap((s) => [...s.writes]);
    return [
      ...steps,
      step(
        'rest',
        [],
        OUTPUT_FIELDS.filter((field) => !written.includes(field)),
      ),
    ];
  };

  describe('the order it derives', () => {
    it('follows the declarations, not the list it is given', () => {
      const first = step('first', [], ['pizzaBalls.weight']);
      const second = step('second', ['pizzaBalls.weight'], ['hydrationRatio']);
      const third = step('third', ['hydrationRatio'], ['total.flour']);

      // Declared backwards: the list is a set, its arrangement decides nothing.
      new ProcessorPipeline(completed([third, second, first])).run(NO_INPUT);

      expect(ran.filter((name) => name !== 'rest')).toEqual([
        'first',
        'second',
        'third',
      ]);
    });

    it('gives the same output whatever order the steps are declared in', () => {
      const steps = [
        step('weight', [], ['pizzaBalls.weight']),
        step('flour', ['pizzaBalls.weight'], ['total.flour']),
        step('salt', ['total.flour'], ['total.salt']),
      ];

      const asDeclared = new ProcessorPipeline(completed(steps)).run(NO_INPUT);
      const reversed = new ProcessorPipeline(
        completed([...steps].reverse()),
      ).run(NO_INPUT);

      expect(reversed).toEqual(asDeclared);
    });

    it('hands a step the fields it declared and nothing else', () => {
      new ProcessorPipeline(
        completed([
          step('weight', [], ['pizzaBalls.weight']),
          step('reader', ['pizzaBalls.weight', 'total.flour'], ['total.salt']),
        ]),
      ).run(NO_INPUT);

      expect(seen['reader']).toEqual({
        pizzaBalls: { weight: 1 },
        total: { flour: 1 },
      });
    });
  });

  describe('the declarations it refuses', () => {
    it('refuses a step reading a field no step writes', () => {
      const everythingButFlour = OUTPUT_FIELDS.filter(
        (field) => field !== 'total.flour',
      );

      expect(
        () =>
          new ProcessorPipeline([
            step('reader', ['total.flour'], everythingButFlour),
          ]),
      ).toThrowError(/No processor writes "total\.flour"/);
    });

    it('refuses two steps writing the same field', () => {
      expect(
        () =>
          new ProcessorPipeline(
            completed([
              step('one', [], ['total.flour']),
              step('other', [], ['total.flour']),
            ]),
          ),
      ).toThrowError(/Two processors write "total\.flour"/);
    });

    it('refuses a step reading what it writes itself', () => {
      expect(
        () =>
          new ProcessorPipeline(
            completed([step('self', ['total.flour'], ['total.flour'])]),
          ),
      ).toThrowError(/reads "total\.flour", which it writes itself/);
    });

    it('refuses steps that depend on each other in a cycle', () => {
      expect(
        () =>
          new ProcessorPipeline(
            completed([
              step('one', ['total.salt'], ['total.flour']),
              step('other', ['total.flour'], ['total.salt']),
            ]),
          ),
      ).toThrowError(/cycle/);
    });

    it('refuses a set that leaves a field of the output unwritten', () => {
      const everythingButOne = OUTPUT_FIELDS.filter(
        (field) => field !== 'poolish.salt',
      );

      expect(
        () => new ProcessorPipeline([step('most', [], everythingButOne)]),
      ).toThrowError(/No processor writes "poolish\.salt"/);
    });

    it('refuses a step that does not produce what it declared', () => {
      const liar: AnyProcessor = {
        reads: [],
        writes: ['total.flour', 'total.water'],
        process: () => fragmentOf(['total.flour']),
      };

      expect(() =>
        new ProcessorPipeline(completed([liar])).run(NO_INPUT),
      ).toThrowError(
        /declares it writes "total\.water" but did not produce it/,
      );
    });
  });

  /** Every declared field, set to 1 — enough to tell present from missing. */
  function fragmentOf(fields: readonly OutputField[]): Record<string, unknown> {
    const fragment: Record<string, unknown> = {};
    for (const field of fields) {
      writeField(fragment, field, 1);
    }
    return fragment;
  }
});
