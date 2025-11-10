import { useForm } from 'react-hook-form';

import { Stack } from '@mui/material';

import { t } from 'i18next';

import TextFieldControl from '../TextFieldControl';

interface IFormInputs {
  firstName: string;
  lastName: string;
  emailAddress: string;
  contactNumber: string;
}

const BasicDetails = () => {
  const { control } = useForm<IFormInputs>({
    defaultValues: {
      firstName: '',
      lastName: '',
      emailAddress: '',
      contactNumber: '',
    },
  });

  return (
    <Stack gap={4} width="100%">
      <Stack width="100%" gap={4} direction="row">
        <TextFieldControl
          id="first-name"
          label={t('userDetails.firstName')}
          name="firstName"
          control={control}
        />
        <TextFieldControl
          id="last-name"
          label={t('userDetails.lastName')}
          name="lastName"
          control={control}
        />
      </Stack>
      <Stack width="100%" gap={4} direction="row">
        <TextFieldControl
          id="email-address"
          label={t('userDetails.emailAddress')}
          name="emailAddress"
          control={control}
        />
        <TextFieldControl
          id="contact-number"
          label={t('userDetails.contactNumber')}
          name="contactNumber"
          control={control}
        />
      </Stack>
    </Stack>
  );
};

export default BasicDetails;
