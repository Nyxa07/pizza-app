import { claudeCode, schema, type WorkflowContext } from '@nyxa/automation';

const prePlanifySchema = schema.object({
  hasSubIssues: schema
    .boolean()
    .describe("Est-ce que l'issue à des sous issues ?"),
});

const planifyOutputSchema = schema.union([
  schema.object({
    status: schema.literal('planned'),
    summary: schema
      .string()
      .describe('Résume en 2 ou 3 phrases le plan proposé.'),
    beforeLabels: schema
      .array(schema.string())
      .describe("Liste des labels de l'issue avant tes mises à jour"),
    afterLabels: schema
      .array(schema.string())
      .describe("Liste des labels de l'issue après tes mises à jour"),
  }),
  schema.object({
    status: schema.literal('not_planned'),
    reason: schema.string().describe("Pourquoi n'a tu pas pu plannifier ?"),
  }),
]);

type PlanifyInput = {
  issue: number;
};

function getPrePrompt(issue: number) {
  return [
    `Détermine si l'issue ${issue} possède des sous issues ou non ?`,
  ].join('\n');
}

function getPrompt(issue: number) {
  return [
    `Créer la spec pour l'issue ${issue}.`,
    `N'oublie pas de lire les commentaires qui pourraient etre des retours a prendre en compte lors d'une deuxième passe de planification.`,
    "Une fois le plan achevé, écrit le dans le corps de l'issue GitHub.",
    'Lorsque des décisions doivent être tranchées, ajoute un commentaire les reprennant une à une avec leurs conséquences.',
    "Retire le label `ready-for-agent` ainsi que `to-planify` (si présent), et ajoute le label `ready-for-human` pour qu'on puisse valider le plan.",
    "Si l'implémentation n'est pas réalisable sans décisions humaines (décisions importantes d'architecture / design) ajoute aussi le label `needs-triage`.",
  ].join('\n');
}

function getPromptMultiIssues(parentIssue: number) {
  return [
    `Lit l'issue #${parentIssue} (+ ses commentaires) ainsi que ses sous issues (+ commentaires).`,
    `Ton objectif est de spécifier et planifier l'ensemble, issue parente et sous issues.`,
    `Ecris les specs / plans dans le corps des issues`,
    'Une fois terminé, retire le label `ready-for-agent`.',
    "Si l'implémentation n'est pas réalisable sans décisions humaines (décisions complexe d'architecture / design) ajoute aussi le label `needs-triage`.",
    'Lorsque des décisions doivent être tranchées, ajoute un commentaire les reprennant une à une avec leurs conséquences.',
  ].join('\n');
}

export default async function runToPlanify(
  context: WorkflowContext<never>,
  input: PlanifyInput,
) {
  const preResult = await context.run(getPrePrompt(input.issue), {
    harness: claudeCode({ model: 'claude-opus-5', effort: 'low' }),
    approval: 'deny',
    access: 'full',
    output: prePlanifySchema,
    skill: 'to-spec',
  });

  if (preResult.hasSubIssues) {
    const result = await context.run(getPromptMultiIssues(input.issue), {
      harness: claudeCode({ model: 'claude-opus-5', effort: 'xhigh' }),
      approval: 'deny',
      access: 'full',
      output: planifyOutputSchema,
      skill: 'to-spec',
    });

    return result;
  }

  const result = await context.run(getPrompt(input.issue), {
    harness: claudeCode({ model: 'claude-opus-5', effort: 'xhigh' }),
    approval: 'deny',
    access: 'full',
    output: planifyOutputSchema,
    skill: 'to-spec',
  });

  return result;
}
