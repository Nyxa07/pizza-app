import { kimiCode, schema, type WorkflowContext } from '@nyxa/automation';

const implementOutputSchema = schema.object({
  summary: schema.string().describe('Résumé des changements'),
});

type ImplementInput = { issue: number };

function getPrompt(input: ImplementInput) {
  return [
    `/skill:implement l'issue #${input.issue}.`,
    `Une fois terminé, ouvre une pull request GitHub et ajoute y le 'Closes #${input.issue}'.`,
    `Si les modifications impliquent des changements visuels / style etc.. Alors produit des screenshots que tu peux ajouter à la pull request pour faciliter les retours.`,
    `Ne commit jamais les screenshots temporaires (par exemple destinés à la PR). Ceux de fastlane sont commités (c'est normal)`,
    `Ne regénère pas les screenshots fastlane, ce sera fait au moment d'une release.`,
  ].join('\n');
}

export default async function runImplement(
  context: WorkflowContext<never>,
  input: ImplementInput,
) {
  const harness = kimiCode({ model: 'kimi-code/k3', effort: 'max' });

  const result = context.run(getPrompt(input), {
    approval: 'auto',
    access: 'full',
    output: implementOutputSchema,
  });
}
