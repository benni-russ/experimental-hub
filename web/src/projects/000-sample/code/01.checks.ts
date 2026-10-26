import { expectEqual } from '../../../codeTask/assert';
import type { CheckModule } from '../../../codeTask/types';

type Double = (n: number) => number;

const module: CheckModule = {
  exportsNeeded: ['double'],
  checks: [
    { name: 'double(4) ist 8', run: ({ exports }) => expectEqual((exports.double as Double)(4), 8) },
    { name: 'double(0) ist 0', run: ({ exports }) => expectEqual((exports.double as Double)(0), 0) },
    { name: 'double(-3) ist -6', run: ({ exports }) => expectEqual((exports.double as Double)(-3), -6) },
  ],
};

export default module;
