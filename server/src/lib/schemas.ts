import { z } from 'zod';

/** IDs aus URL und Body: nicht leer, höchstens 100 Zeichen. */
export const idSchema = z
  .string({ error: 'Die ID fehlt oder ist kein Text.' })
  .min(1, 'Die ID darf nicht leer sein.')
  .max(100, 'Die ID ist zu lang (höchstens 100 Zeichen).');

export const idParams = z.object({ id: idSchema });
export const projectIdQuery = z.object({ projectId: idSchema });
