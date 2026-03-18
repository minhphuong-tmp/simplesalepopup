import {z} from 'zod';
import {validate} from './validate';

const getNotificationsSchema = z.object({
  order: z.enum(['timestamp_desc', 'timestamp_asc']).optional(),
  limit: z.number().min(1).max(100).optional(),
  after: z.string().optional(),
  before: z.string().optional()
});

const syncNotificationsSchema = z.object({
  limit: z.number().min(1).max(250).optional()
});

export const validateGetNotifications = validate(getNotificationsSchema);
export const validateSyncNotifications = validate(syncNotificationsSchema);
