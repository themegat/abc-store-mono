/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { FormState, useForm } from 'react-hook-form';

import { Stack } from '@mui/material';

import { t } from 'i18next';

import TextFieldControl from '../TextFieldControl';

export interface BasicDetailsFormInputs {
  firstName: string;
  lastName: string;
  emailAddress: string;
  contactNumber?: string;
}

type Props = {
  id: string;
  stepIndex: number;
  setStepData: (index: number, valid: boolean, values: BasicDetailsFormInputs) => void;
  values?: BasicDetailsFormInputs;
};

const BasicDetails = ({ id, stepIndex, setStepData, values }: Props) => {
  const { control, setValue, formState, trigger, getValues } = useForm<any>({
    context: id,
    defaultValues: {
      firstName: values?.firstName || '',
      lastName: values?.lastName || '',
      emailAddress: values?.emailAddress || '',
      contactNumber: values?.contactNumber || '',
    },
  });

  const [currentState, setCurrentState] = useState<FormState<any> | undefined>(undefined);

  const update = useCallback(() => {
    setStepData(stepIndex, formState.isValid, getValues());
  }, [stepIndex, formState.isValid, getValues, setStepData]);

  useEffect(() => {
    if (currentState?.defaultValues !== formState?.defaultValues) {
      update();
      setCurrentState(formState);
    }
  }, [id, update, formState, currentState]);

  return (
    <Stack id={id} gap={4} width="100%">
      <Stack width="100%" gap={4} direction="row">
        <TextFieldControl
          id="first-name"
          label={t('userDetails.firstName')}
          name="firstName"
          control={control}
          setValue={setValue}
          trigger={trigger}
          rules={{ required: true }}
        />
        <TextFieldControl
          id="last-name"
          label={t('userDetails.lastName')}
          name="lastName"
          control={control}
          setValue={setValue}
          trigger={trigger}
          rules={{ required: true }}
        />
      </Stack>
      <Stack width="100%" gap={4} direction="row">
        <TextFieldControl
          id="email-address"
          label={t('userDetails.emailAddress')}
          name="emailAddress"
          control={control}
          setValue={setValue}
          trigger={trigger}
          rules={{ required: true }}
        />
        <TextFieldControl
          id="contact-number"
          label={t('userDetails.contactNumber')}
          name="contactNumber"
          control={control}
          setValue={setValue}
          trigger={trigger}
        />
      </Stack>
    </Stack>
  );
};

export default BasicDetails;
