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
  parentIssue: number | undefined;
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
    input.parentIssue
      ? `L'issue fait partie d'un travail plus large, son parent est #${input.parentIssue}`
      : `L'issue est standalone et n'a donc aucune issue parente.`,
    "Inutile de faire des captures d'écrans de l'application, elles seront générées le moment venu avant un déploiement",
    input.pullRequest
      ? `Une fois terminé, commit, push et ouvre une pull request (PR) GitHub associée à l'issue parente si elle existe, sinon associée à l'issue standalone.`
      : `La pull request existe déjà : ${input.pullRequest}, commit et push`,
    input.parentIssue
      ? `Ajoute Closes #${input.parentIssue} à la PR (si pas déjà en place) pour que l'issue parente se cloture une fois tout le travail terminé.`
      : `Closes #${input.issue} à la PR pour que l'issue soit cloturer quand je ferai le merge de la PR.`,
    input.parentIssue
      ? `Cloture la sous issue (#${input.issue}) que tu viens d'implémenter`
      : '',
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
