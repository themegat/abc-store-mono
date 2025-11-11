import { ChangeEventHandler } from 'react';
import { Control, Controller, RegisterOptions, UseFormSetValue, UseFormTrigger } from 'react-hook-form';

import { SxProps, TextField } from '@mui/material';

import { t } from 'i18next';

type TextFieldControlProps = {
  name: string;
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger: UseFormTrigger<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: Omit<RegisterOptions<any, string>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"> | undefined;
  sx?: SxProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any, any, any>;
  fullWidth?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

const TextFieldControl = ({
  name,
  id,
  label,
  control,
  setValue,
  trigger,
  rules,
  sx,
  fullWidth = true,
  onChange,
}: TextFieldControlProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          sx={sx}
          fullWidth={fullWidth}
          size="small"
          label={`${label} ${rules?.required ? '*' : ''}`}
          variant="outlined"
          onChange={(e) => {
            setValue(name, e.target.value);
            onChange?.(e);
            trigger(name);
          }}
          value={field.value || ''}
          id={id}
          type="text"
          error={fieldState.error ? true : false}
          helperText={fieldState.error ? t('validation.required', { fieldName: label }) : ''}
        />
      )}
    />
  );
};

export default TextFieldControl;
