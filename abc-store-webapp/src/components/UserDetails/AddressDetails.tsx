import { useForm } from 'react-hook-form';

import { Stack } from '@mui/material';

import { t } from 'i18next';

import TextFieldControl from '../TextFieldControl';

interface IFormInputs {
  streetNumber: string;
  suburb: string;
  areaCode: string;
}

type Props = {
  id: string;
};

const AddressDetails = ({ id }: Props) => {
  const { control } = useForm<IFormInputs>({
    defaultValues: {
      streetNumber: '',
      suburb: '',
      areaCode: '',
    },
  });

  return (
    <Stack id={id} gap={4} width="100%">
      <Stack width="100%" gap={4} direction="row">
        <TextFieldControl
          id="street-number"
          label={t('address.line1')}
          name="streetNumber"
          control={control}
        />
        <TextFieldControl id="suburb" label={t('address.suburb')} name="suburb" control={control} />
      </Stack>
      <TextFieldControl
        id="area-code"
        label={t('address.areaCode')}
        name="areaCode"
        control={control}
        fullWidth={false}
        sx={{ width: '48%' }}
      />
    </Stack>
  );
};

export default AddressDetails;
