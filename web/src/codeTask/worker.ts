import { CHECKS } from './registry';
import { installWorker, type WorkerScope } from './workerHost';

// Dünne Hülle: die Verdrahtung steht testbar in workerHost.ts.
installWorker(globalThis as unknown as WorkerScope, CHECKS);
