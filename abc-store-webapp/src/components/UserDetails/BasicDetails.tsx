import { Control, UseFormSetValue, UseFormTrigger } from 'react-hook-form';

import { Stack } from '@mui/material';

import { t } from 'i18next';

import useDevice from '@/hooks/useDevice';

import SelectControl from '../SelectControl';
import TextFieldControl from '../TextFieldControl';

export enum BasicDetailsFormType {
  ON_BOARDING,
  CHECKOUT,
}

export interface BasicDetailsFormInputs {
  firstName: string;
  lastName: string;
  emailAddress: string;
  contactNumber?: string;
  preferredCurrency?: string;
}

type Props = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<BasicDetailsFormInputs, any, BasicDetailsFormInputs>;
  trigger: UseFormTrigger<BasicDetailsFormInputs>;
  setValue: UseFormSetValue<BasicDetailsFormInputs>;
  formType: BasicDetailsFormType;
  currencyOptions?: { id: string; value: string }[];
};

const BasicDetails = ({ id, control, trigger, setValue, formType, currencyOptions }: Props) => {
  const { isMobile } = useDevice();
  return (
    <Stack id={id} gap={4} width="100%">
      <Stack width="100%" gap={4} direction={isMobile ? 'column' : 'row'}>
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
      <Stack width="100%" gap={4} direction={isMobile ? 'column' : 'row'}>
        {formType === BasicDetailsFormType.CHECKOUT && (
          <TextFieldControl
            id="email-address"
            label={t('userDetails.emailAddress')}
            name="emailAddress"
            control={control}
            setValue={setValue}
            trigger={trigger}
            rules={{ required: true }}
            fullWidth={true}
          />
        )}
        {formType === BasicDetailsFormType.ON_BOARDING && (
          <Stack sx={{ width: isMobile ? '100%' : '46%' }}>
            <SelectControl
              name="preferredCurrency"
              id="preferred-currency"
              label={t('userDetails.preferredCurrency')}
              options={currencyOptions || []}
              control={control}
              setValue={setValue}
              trigger={trigger}
              rules={{ required: true }}
              fullWidth={true}
            />
          </Stack>
        )}
        <TextFieldControl
          id="contact-number"
          label={t('userDetails.contactNumber')}
          name="contactNumber"
          control={control}
          setValue={setValue}
          trigger={trigger}
          sx={{ width: formType === BasicDetailsFormType.CHECKOUT || isMobile ? '100%' : '46%' }}
        />
      </Stack>
    </Stack>
  );
};

export default BasicDetails;
