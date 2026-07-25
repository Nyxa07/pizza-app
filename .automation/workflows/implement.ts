import {
  InferSchema,
  kimiCode,
  schema,
  type WorkflowContext,
} from '@nyxa/automation';

const implementOutputSchema = schema.union([
  schema.object({
    status: schema
      .literal('implementation_success')
      .describe('Implémentation réussi'),
    summary: schema.string().describe('Résumé concis des changements'),
  }),
  schema.object({
    status: schema.literal('implementation_failed'),
    reason: schema.string().describe("Pourquoi l'implémentation non possible"),
  }),
]);

type ImplementInput = { issue: number; devBranch: string };
export type ImplementationResult = InferSchema<typeof implementOutputSchema>;
export type ImplementationResultFailed = Extract<
  ImplementationResult,
  { status: 'implementation_failed' }
>;
export type ImplementationResultSuccess = Extract<
  ImplementationResult,
  { status: 'implementation_success' }
>;

function getPrompt(input: ImplementInput) {
  return [
    `/skill:implement l'issue #${input.issue}, utilise la branche ${input.devBranch} qui à déjà étée créée. Si la branche est manquant ou stale, tu échoue immédiatement avec le statut "implementation_failed"`,
    `Lit aussi les commentaires qui pourront indiquer / préciser une direction plutot qu'une autre. L'issue est une discussion ayant pris place avant l'implémentation, considère la en tant que telle et prend bien en compte les dernières informations.`,
    `Une fois terminé, ouvre une pull request (PR) GitHub et ajoute y le 'Closes #${input.issue}'.`,
    `Si les modifications impliquent des changements visuels / style etc.. Alors produit des screenshots que tu peux ajouter à la pull request pour faciliter les retours.`,
    `Ne commit jamais les screenshots temporaires (par exemple destinés à la PR). Ceux de fastlane sont commités (c'est normal)`,
    `Ne regénère pas les screenshots fastlane, ce sera fait au moment d'une release.`,
    `Retire le label 'ready-for-agent'`,
  ].join('\n');
}

export default async function runImplementation(
  context: WorkflowContext<never>,
  input: ImplementInput,
) {
  const harness = kimiCode({ model: 'kimi-code/k3', effort: 'max' });

  const result = await context.run(getPrompt(input), {
    harness,
    approval: 'auto',
    access: 'full',
    output: implementOutputSchema,
  });

  return result;
}
