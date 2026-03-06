
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { GoalsFormData } from '@/schemas/goalsFormSchema';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  form: UseFormReturn<GoalsFormData>;
  name: keyof GoalsFormData;
  label: string;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
}

export const SelectField = ({ form, name, label, placeholder, options, disabled = false }: SelectFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select 
          onValueChange={field.onChange} 
          defaultValue={field.value?.toString()}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);
