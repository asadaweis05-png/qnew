
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { NumericField } from './NumericField';
import { SelectField } from './SelectField';
import { GoalsFormData } from '@/schemas/goalsFormSchema';
import { Profile } from '@/types/database';

interface GoalsFormContentProps {
  form: UseFormReturn<GoalsFormData>;
  profile: Profile | null;
  isSubmitting: boolean;
  onSubmit: (data: GoalsFormData) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}

export const GoalsFormContent: React.FC<GoalsFormContentProps> = ({ 
  form, 
  profile, 
  isSubmitting, 
  onSubmit, 
  onDelete 
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <NumericField
          form={form}
          name="weight_kg"
          label="Weight (kg)"
          placeholder="70.5"
          step="0.1"
        />

        <NumericField
          form={form}
          name="height_cm"
          label="Height (cm)"
          placeholder="175"
        />

        <NumericField
          form={form}
          name="age"
          label="Age"
          placeholder="25"
        />

        <SelectField
          form={form}
          name="gender"
          label="Gender"
          placeholder="Select your gender"
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
        />

        <SelectField
          form={form}
          name="activity_level"
          label="Activity Level"
          placeholder="Select your activity level"
          options={[
            { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
            { value: 'lightly_active', label: 'Lightly Active (1-3 days/week)' },
            { value: 'moderately_active', label: 'Moderately Active (3-5 days/week)' },
            { value: 'very_active', label: 'Very Active (6-7 days/week)' },
            { value: 'extra_active', label: 'Extra Active (very intense exercise)' },
          ]}
        />

        <SelectField
          form={form}
          name="goal"
          label="Goal"
          placeholder="Select your goal"
          options={[
            { value: 'lose_weight', label: 'Lose Weight' },
            { value: 'maintain', label: 'Maintain Weight' },
            { value: 'gain_weight', label: 'Gain Weight' },
          ]}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (profile?.target_calories ? "Update Goals" : "Save Goals")}
          </Button>
          
          {profile?.target_calories && (
            <Button 
              type="button" 
              variant="destructive" 
              className="flex-1" 
              onClick={() => onDelete()} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Goals"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
