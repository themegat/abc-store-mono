import { Control, UseFormSetValue, UseFormTrigger } from 'react-hook-form';

import { Stack } from '@mui/material';

import { t } from 'i18next';

import useDevice from '@/hooks/useDevice';

import TextFieldControl from '../TextFieldControl';

export interface AddressDetailsFormInputs {
  streetNumber: string;
  suburb: string;
  areaCode: string;
}

type Props = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<AddressDetailsFormInputs, any, AddressDetailsFormInputs>;
  trigger: UseFormTrigger<AddressDetailsFormInputs>;
  setValue: UseFormSetValue<AddressDetailsFormInputs>;
};

const AddressDetails = ({ id, control, setValue, trigger }: Props) => {
  const { isMobile } = useDevice();

  return (
    <Stack id={id} gap={4} width="100%">
      <Stack width="100%" gap={4} direction={isMobile ? 'column' : 'row'}>
        <TextFieldControl
          id="street-number"
          label={t('address.line1')}
          name="streetNumber"
          control={control}
          setValue={setValue}
          trigger={trigger}
          rules={{ required: true }}
          onChange={() => trigger('streetNumber')}
        />
        <TextFieldControl
          id="suburb"
          label={t('address.suburb')}
          name="suburb"
          control={control}
          setValue={setValue}
          trigger={trigger}
          rules={{ required: true }}
          onChange={() => trigger('suburb')}
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
        onChange={() => trigger('areaCode')}
      />
    </Stack>
  );
};

export default AddressDetails;
