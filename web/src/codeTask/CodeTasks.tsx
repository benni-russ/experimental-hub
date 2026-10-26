import type { CodeTaskMeta } from '@hub/shared';
import { CodeTask } from './CodeTask';
import './codeTask.css';

export default function CodeTasks({ tasks }: { tasks: CodeTaskMeta[] }) {
  return (
    <div className="code-tasks">
      {tasks.map((task) => (
        <CodeTask key={task.id} task={task} />
      ))}
    </div>
  );
}
