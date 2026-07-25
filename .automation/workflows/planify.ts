import { kimiCode, schema, type WorkflowContext } from '@nyxa/automation';

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
    `Analyse l'issue ${issue} et propose un plan d'implémentation robuste et détaillé.`,
    `N'oublie pas de lire les commentaires qui pourraient etre des retours a prendre en compte lors d'une deuxième passe de planification.`,
    'Si plusieurs design / architectures sont possibles, propose les dans ton plan et nous choisirons plus tard.',
    "Une fois le plan achevé, écrit le dans l'issue GitHub sans remplacer le corps de l'issue, créer un nouveau commentaire.",
    "Retire le label `ready-for-agent` ainsi que `to-planify` (si présent), et ajoute le label `ready-for-human` pour qu'on puisse valider le plan.",
    'Si tu as fais des propositions de design qui nécéssite une décision ajoute aussi le label `needs-triage`',
  ].join('\n');
}

export default async function runToPlanify(
  context: WorkflowContext<never>,
  input: PlanifyInput,
) {
  const harness = kimiCode({ model: 'kimi-code/k3', effort: 'max' });

  const result = await context.run(getPrompt(input.issue), {
    approval: 'auto',
    access: 'full',
    output: planifyOutputSchema,
  });

  return result;
}
