import { Control, Controller } from 'react-hook-form';

import { SxProps, TextField } from '@mui/material';

import { t } from 'i18next';

type TextFieldControlProps = {
  name: string;
  id: string;
  label: string;
  sx?: SxProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any, any, any>;
  fullWidth?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextFieldControl = ({
  name,
  id,
  label,
  control,
  sx,
  fullWidth = true,
}: TextFieldControlProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: true }}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          sx={sx}
          fullWidth={fullWidth}
          size="small"
          label={label}
          variant="outlined"
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
