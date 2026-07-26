import {
  claudeCode,
  InferSchema,
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

type ImplementInput = {
  issue: number;
  devBranch: string;
  pullRequest: number | undefined;
};
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
    `L'issue est #${input.issue}. Utilise la branche ${input.devBranch} qui à déjà étée créée. Si la branche est manquant ou stale, tu échoue immédiatement avec le statut "implementation_failed"`,
    "Inutile de faire des captures d'écrans de l'application, elles seront générées le moment venu avant un déploiement",
    input.pullRequest
      ? `Une fois terminé, commit, push et ouvre une pull request (PR) GitHub.`
      : `La pull request existe déjà : ${input.pullRequest}, commit et push`,
    `Ajoute le 'Closes #${input.issue} à la PR pour que l'issue se clôture lors de du merge de la PR (que tu ne fais surtout pas toi meme).`,
    `Retire le label 'ready-for-agent' et ajoute le label 'implemented' sur l'issue.`,
  ].join('\n');
}

export default async function runImplementation(
  context: WorkflowContext<never>,
  input: ImplementInput,
) {
  const harness = claudeCode({ model: 'claude-opus-5', effort: 'xhigh' });

  const result = await context.run(getPrompt(input), {
    harness,
    approval: 'deny',
    access: 'full',
    output: implementOutputSchema,
    skill: 'implement',
    timeout: false,
  });

  return result;
}
