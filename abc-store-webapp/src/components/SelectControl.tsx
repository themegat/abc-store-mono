import {
  Control,
  Controller,
  RegisterOptions,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Typography,
} from '@mui/material';

import { t } from 'i18next';

type SelectControlProps = {
  name: string;
  id: string;
  label: string;
  options: { id: string; value: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger: UseFormTrigger<any>;
  rules?:
    | Omit<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        RegisterOptions<any, string>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
      >
    | undefined;
  sx?: SxProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any, any, any>;
  fullWidth?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (e: SelectChangeEvent<any>) => void;
};

const SelectControl = ({
  name,
  id,
  label,
  options,
  control,
  setValue,
  trigger,
  rules,
  sx,
  fullWidth = true,
  onChange,
}: SelectControlProps) => {
  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <FormControl>
              <InputLabel id={`${id}-label`}>{`${label} ${rules?.required ? '*' : ''}`}</InputLabel>
              <Select
                {...field}
                sx={sx}
                fullWidth={fullWidth}
                size="small"
                id={id}
                label={`${label} ${rules?.required ? '*' : ''}`}
                labelId={`${id}-label`}
                error={fieldState.error ? true : false}
                onChange={(e) => {
                  setValue(name, e.target.value);
                  onChange?.(e);
                  trigger(name);
                }}
              >
                {options?.map((option: { id: string; value: string }) => {
                  return (
                    <MenuItem key={option.id} value={option.value}>
                      {option.value}
                    </MenuItem>
                  );
                })}
              </Select>
              {fieldState.error && (
                <Typography marginTop={1} marginLeft={2} variant="caption" color="error">
                  {t('validation.required', {
                    fieldName: label,
                  })}
                </Typography>
              )}
            </FormControl>
          </>
        )}
      />
    </>
  );
};

export default SelectControl;
