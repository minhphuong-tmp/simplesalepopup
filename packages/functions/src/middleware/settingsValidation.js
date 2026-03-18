import {z} from 'zod';
import {validate} from './validate';

const updateSettingsSchema = z.object({
  position: z.enum(['bottom-left', 'bottom-right', 'top-left', 'top-right']).optional(),
  hideTimeAgo: z.boolean().optional(),
  truncateProductName: z.boolean().optional(),
  displayDuration: z.number().min(1).max(60).optional(),
  firstDelay: z.number().min(0).max(300).optional(),
  popsInterval: z.number().min(1).max(60).optional(),
  maxPopsDisplay: z.number().min(1).max(100).optional(),
  allowShow: z.enum(['all', 'specific']).optional(),
  includedUrls: z.string().optional(),
  excludedUrls: z.string().optional()
});

export const validateUpdateSettings = validate(updateSettingsSchema);
