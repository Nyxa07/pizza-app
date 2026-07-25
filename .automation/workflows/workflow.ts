import { kimiCode, defineWorkflow, schema } from '@nyxa/automation';
import runInitialize from './initialize.js';
import runToPlanify from './planify.js';
import runImplementation from './implement.js';

async function sleep(seconds: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, seconds * 1000);
  });
}

const workflow = defineWorkflow({
  harness: kimiCode({ model: 'kimi-code/k3', effort: 'max' }),
  async run(context) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const initResult = await runInitialize(context);
      console.error('Init result', initResult);

      if (initResult.status === 'no_work') {
        await sleep(300);
        continue;
      }

      if (initResult.toPlanify) {
        const planifyResult = await runToPlanify(context, {
          issue: initResult.issue,
        });
        console.error('Planify result', planifyResult);
      }

      if (!initResult.toPlanify) {
        const implementationResult = await runImplementation(context, {
          issue: initResult.issue,
          devBranch: initResult.devBranch,
          pullRequest: initResult.existingPullRequest,
        });

        if (implementationResult.status === 'implementation_failed') {
          throw new Error(implementationResult.reason);
        }

        console.error('Implementation result', implementationResult);
      }
    }
  },
});

export default workflow;
