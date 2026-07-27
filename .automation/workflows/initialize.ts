import {
  claudeCode,
  InferSchema,
  schema,
  type WorkflowContext,
} from '@nyxa/automation';

const initializeOutputSchema = schema.union([
  schema.object({
    status: schema.literal('initialized'),
    issue: schema.integer().minimum(1).describe('La GitHub issue sélectionnée'),
    parentIssue: schema
      .integer()
      .minimum(1)
      .optional()
      .describe("L'issue parente de l'issue sélectionnée"),
    devBranch: schema
      .string()
      .describe(
        "Le nom choisi pour la branche de dev servant à implementer l'issue",
      ),
    toPlanify: schema
      .boolean()
      .describe("L'issue porte t-elle le label `to-planify` ?"),
    reason: schema.string().describe('Pourquoi ce choix ?'),
    existingPullRequest: schema
      .integer()
      .minimum(1)
      .optional()
      .describe('La pull request existante le cas échéant'),
  }),
  schema.object({
    status: schema.literal('no_work'),
  }),
]);

export type InitializeResult = InferSchema<typeof initializeOutputSchema>;

export default async function runInitialize(
  context: WorkflowContext<never>,
): Promise<InitializeResult> {
  const harness = claudeCode({ model: 'claude-opus-5', effort: 'low' });
  const result = await context.run(
    [
      "Ton rôle est de sélectionner une issue GitHub éligible à la plannification ou à l'implémentation.",
      "Si l'issue séléctionné est une sous issue alors la branche de la pull request doivent etre associé à l'issue parente, sinon directement à l'issue quand elle est `standalone`",
      "Si une PR existe pour l'issue sélectionnée (ou l'issue parente, le cas échéant), ne créer pas de branche et réutilise celle existante (celle de la PR), sinon créer la branche à partir de origin/main pour le développement.",
      "La branche de developpement doit toujours être associée à l'issue parent quand il y en a une et doit suivre le modèle : `feat/[issue_number|parent_issue_number]-...`, `chore/[issue_number|parent_issue_number]-...`, `fix/[issue_number|parent_issue_number]-...`",
      "Ne push pas la branch immédiatement, ce sera fait lors de l'implémentation qui est hors scope ici.",
      'Une issue est éligible si elle à le label `ready-for-agent`',
      'Elle peut ou non avoir le label `to-planify`',
      "Ne choisie des issues faisant partie d'un lot (sous issues + parent) uniquement quand elles sont toutes `ready-for-agent` et aucune en `to-planify`, `needs-triage` ou `ready-for-human`. On veut que le lot soit entierement ready avant de le commencer.",
      'Si une issue `ready-for-agent` sans label `to-planify existe`, choisi la en priorité.',
    ].join('\n'),
    {
      harness,
      approval: 'deny',
      access: 'full',
      output: initializeOutputSchema,
    },
  );

  return result;
}
