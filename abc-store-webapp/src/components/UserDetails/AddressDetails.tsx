import { useCallback, useEffect, useState } from 'react';
import { FormState, useForm } from 'react-hook-form';

import { Stack } from '@mui/material';

import { t } from 'i18next';

import TextFieldControl from '../TextFieldControl';

export interface AddressDetailsFormInputs {
  streetNumber: string;
  suburb: string;
  areaCode: string;
}

type Props = {
  id: string;
  stepIndex: number;
  setStepData: (index: number, valid: boolean, values: AddressDetailsFormInputs) => void;
  values?: AddressDetailsFormInputs;
};

const AddressDetails = ({ id, stepIndex, setStepData, values }: Props) => {
  const { control, setValue, trigger, formState, getValues } = useForm<AddressDetailsFormInputs>({
    defaultValues: {
      streetNumber: values?.streetNumber || '',
      suburb: values?.suburb || '',
      areaCode: values?.areaCode || '',
    },
  });

  const valuesChanged = useCallback(
    (name: 'streetNumber' | 'suburb' | 'areaCode') => {
      trigger(name);
      setStepData(stepIndex, formState.isValid, getValues());
    },
    [stepIndex, formState, setStepData, getValues, trigger],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentState, setCurrentState] = useState<FormState<any> | undefined>(undefined);

  const update = useCallback(() => {
    setStepData(stepIndex, formState.isValid, getValues());
  }, [stepIndex, formState.isValid, getValues, setStepData]);

  useEffect(() => {
    setValue('streetNumber', values?.streetNumber ?? '');
    setValue('suburb', values?.suburb ?? '');
    setValue('areaCode', values?.areaCode ?? '');
  }, [values, setValue]);

  useEffect(() => {
    if (currentState?.defaultValues !== formState?.defaultValues) {
      update();
      setCurrentState(formState);
    }
  }, [id, update, currentState, formState]);

  return (
    <Stack id={id} gap={4} width="100%">
      <Stack width="100%" gap={4} direction="row">
        <TextFieldControl
          id="street-number"
          label={t('address.line1')}
          name="streetNumber"
          control={control}
          setValue={setValue}
          trigger={trigger}
          rules={{ required: true }}
          onChange={() => valuesChanged('streetNumber')}
        />
        <TextFieldControl
          id="suburb"
          label={t('address.suburb')}
          name="suburb"
          control={control}
          setValue={setValue}
          trigger={trigger}
          rules={{ required: true }}
          onChange={() => valuesChanged('suburb')}
        />
      </Stack>
      <TextFieldControl
        id="area-code"
        label={t('address.areaCode')}
        name="areaCode"
        control={control}
        setValue={setValue}
        trigger={trigger}
        fullWidth={false}
        sx={{ width: '48%' }}
        rules={{ required: true }}
        onChange={() => valuesChanged('areaCode')}
      />
    </Stack>
  );
};

export default AddressDetails;
