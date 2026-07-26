import { claudeCode, schema, type WorkflowContext } from '@nyxa/automation';

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

function getPrompt(issue: number) {
  return [
    `Créer la spec pour l'issue ${issue}.`,
    `N'oublie pas de lire les commentaires qui pourraient etre des retours a prendre en compte lors d'une deuxième passe de planification.`,
    "Une fois le plan achevé, écrit le dans le corps de l'issue GitHub puis ajoute un commentaire résumant en quelques phrases le plan / spec pour des utilisateurs moins techniques.",
    "Retire le label `ready-for-agent` ainsi que `to-planify` (si présent), et ajoute le label `ready-for-human` pour qu'on puisse valider le plan.",
    'Si tu as fais des propositions de design qui nécéssite une décision ajoute aussi le label `needs-triage`',
  ].join('\n');
}

export default async function runToPlanify(
  context: WorkflowContext<never>,
  input: PlanifyInput,
) {
  const harness = claudeCode({ model: 'claude-opus-5', effort: 'xhigh' });

  const result = await context.run(getPrompt(input.issue), {
    harness,
    approval: 'deny',
    access: 'full',
    output: planifyOutputSchema,
    skill: 'to-spec',
  });

  return result;
}
