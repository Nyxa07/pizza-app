import {
  InferSchema,
  kimiCode,
  schema,
  type WorkflowContext,
} from '@nyxa/automation';

const initializeOutputSchema = schema.union([
  schema.object({
    status: schema.literal('initialized'),
    issue: schema.integer().minimum(1).describe('La GitHub issue sélectionnée'),
    devBranch: schema
      .string()
      .describe(
        "Le nom choisi pour la branche de dev servant à implementer l'issue",
      ),
    toPlanify: schema
      .boolean()
      .describe("L'issue porte t-elle le label `to-planify` ?"),
    reason: schema.string().describe('Pourquoi ce choix ?'),
  }),
  schema.object({
    status: schema.literal('no_work'),
  }),
]);

export type InitializeResult = InferSchema<typeof initializeOutputSchema>;

export default async function runInitialize(
  context: WorkflowContext<never>,
): Promise<InitializeResult> {
  const harness = kimiCode({ model: 'kimi-code/k3', effort: 'low' });
  const result = await context.run(
    [
      "Ton rôle est de sélectionner une issue GitHub éligible à la plannification ou à l'implémentation, puis créer la branche de dev à utiliser à partie de origin/main.",
      'La branche de dev doit suivre le modèle : `feat/...`, `chore/...`, `fix/...`',
      'Une issue est éligible si elle à le label `ready-for-agent`.',
      'Elle peut ou non avoir le label `to-planify`',
      'Si une issue `ready-for-agent` sans label `to-planify existe`, choisi la en priorité',
    ].join('\n'),
    {
      harness,
      approval: 'auto',
      access: 'full',
      output: initializeOutputSchema,
    },
  );

  return result;
}
