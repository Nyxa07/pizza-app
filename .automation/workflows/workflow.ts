import { kimiCode, defineWorkflow, schema } from '@nyxa/automation';
import runInitialize from './initialize.js';
import runToPlanify from './planify.js';

async function sleep(seconds: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, seconds * 1000);
  });
}

const workflow = defineWorkflow({
  harness: kimiCode(),
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
      }
    }
  },
});

export default workflow;
