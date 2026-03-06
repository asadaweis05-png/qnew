
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { goalsFormSchema, type GoalsFormData } from '@/schemas/goalsFormSchema';
import { GoalsFormContent } from './goals/GoalsFormContent';
import { useGoalsForm } from './goals/useGoalsForm';

const GoalsForm = () => {
  const { user } = useAuth();
  const { profile, isSubmitting, onSubmit, handleDelete } = useGoalsForm();
  
  const form = useForm<GoalsFormData>({
    resolver: zodResolver(goalsFormSchema),
    defaultValues: {
      weight_kg: profile?.weight_kg || undefined,
      height_cm: profile?.height_cm || undefined,
      age: profile?.age || undefined,
      gender: profile?.gender as 'male' | 'female' | 'other' | undefined,
      activity_level: profile?.activity_level as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | undefined,
      goal: profile?.goal as 'lose_weight' | 'maintain' | 'gain_weight' | undefined,
    },
  });
  
  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        weight_kg: profile.weight_kg || undefined,
        height_cm: profile.height_cm || undefined,
        age: profile.age || undefined,
        gender: profile.gender as 'male' | 'female' | 'other' | undefined,
        activity_level: profile.activity_level as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | undefined,
        goal: profile.goal as 'lose_weight' | 'maintain' | 'gain_weight' | undefined,
      });
    }
  }, [profile, form]);

  return (
    <GoalsFormContent 
      form={form}
      profile={profile}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onDelete={handleDelete}
    />
  );
};

export default GoalsForm;
