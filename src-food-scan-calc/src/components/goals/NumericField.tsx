
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { GoalsFormData } from '@/schemas/goalsFormSchema';

interface NumericFieldProps {
  form: UseFormReturn<GoalsFormData>;
  name: 'weight_kg' | 'height_cm' | 'age';
  label: string;
  placeholder: string;
  step?: string;
  disabled?: boolean;
}

export const NumericField = ({ form, name, label, placeholder, step = "1", disabled = false }: NumericFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input 
            type="number" 
            step={step} 
            placeholder={placeholder} 
            {...field} 
            value={field.value || ''} 
            disabled={disabled}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
