import { kimiCode, schema, type WorkflowContext } from '@nyxa/automation';

const implementOutputSchema = schema.object({
  summary: schema.string().describe('Résumé des changements'),
});

type ImplementInput = { issue: number };

function getPrompt(input: ImplementInput) {
  return [
    `Implement l'issue #${input.issue}.`,
    `Une fois terminé, ouvre une pull request GitHub et ajoute y le 'Closes #${input.issue}'.`,
    `Chrome headless est disponible dans l'environnement courant. Tu peux t'en servir pour tester l'application.`,
    `Ne tente pas de tester l'application buildé android, uniquement la version web`,
    `Si les modifications impliquent des changements visuels / style etc.. Alors produit des screenshots que tu peux ajouter à la pull request pour faciliter les retours.`,
    `Ne commit jamais les screenshots, si ils sont stockés dans le repo, alors supprime les avant de commit (préfère les stocker dans /tmp/...)`,
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
