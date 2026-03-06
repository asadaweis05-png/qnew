
import * as z from 'zod';

export const goalsFormSchema = z.object({
  weight_kg: z.coerce.number().min(1),
  height_cm: z.coerce.number().min(1),
  age: z.coerce.number().min(1),
  gender: z.enum(['male', 'female', 'other']),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
  goal: z.enum(['lose_weight', 'maintain', 'gain_weight']),
});

export type GoalsFormData = z.infer<typeof goalsFormSchema>;
