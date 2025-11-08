import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { t } from 'i18next';

import { config } from '@/config';
import {
  useGetApiExchangeRateAllQuery,
  usePostApiUserDetailsUpdateCreateMutation,
} from '@/store/api/abcApi';
import { AppDispatch } from '@/store/store';

import { User, UserState, selectUser, setUser } from '../../store/slice/userSlice';

interface IFormInputs {
  firstName: string;
  lastName: string;
  preferredCurrency: string;
}

const UserDetails = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { data: currencyResponse } = useGetApiExchangeRateAllQuery();
  const [postApiUserDetailsUpdateCreate] = usePostApiUserDetailsUpdateCreateMutation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  const { control, handleSubmit } = useForm<IFormInputs>({
    defaultValues: {
      firstName: '',
      lastName: '',
      preferredCurrency: '',
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    setIsLoading(true);

    if (!user) {
      setError('User not found');
      setIsLoading(false);
      return;
    }

    const updateUser: User = {
      ...user,
      firstName: data.firstName,
      lastName: data.lastName,
      preferredCurrency: data.preferredCurrency,
    };
    postApiUserDetailsUpdateCreate({
      userDetailsDto: {
        firstName: updateUser.firstName,
        lastName: updateUser.lastName,
        preferredCurrency: updateUser.preferredCurrency,
        userId: updateUser.uid,
      },
    })
      .unwrap()
      .then(() => {
        updateUser.state = UserState.COMPLETE;
        dispatch(setUser(updateUser));
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const handleOnSkip = () => {
    if (user) {
      const updateUser: User = {
        ...user,
        state: UserState.SKIPPED,
        preferredCurrency: config.preferedCurrency,
      };
      dispatch(setUser(updateUser));
    }
  };

  return (
    <Stack>
      <Stack
        sx={{
          borderWidth: 1,
          borderColor: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          paddingX: 5,
          paddingY: 5,
          borderRadius: 2,
        }}
      >
        <Stack marginBottom={2} gap={1} alignItems="center">
          <Typography fontWeight={600} variant="h6">
            {t('userDetails.title')}
          </Typography>
          <Typography fontSize={14}>{t('userDetails.subTitle')}</Typography>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={2}>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  sx={{ minWidth: 300 }}
                  size="small"
                  label={t('userDetails.firstName')}
                  variant="outlined"
                  id="first-name"
                  type="text"
                  error={fieldState.error ? true : false}
                  helperText={
                    fieldState.error
                      ? t('validation.required', { fieldName: t('userDetails.firstName') })
                      : ''
                  }
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  size="small"
                  label={t('userDetails.lastName')}
                  variant="outlined"
                  id="last-name"
                  type="text"
                  error={fieldState.error ? true : false}
                  helperText={
                    fieldState.error
                      ? t('validation.required', { fieldName: t('userDetails.lastName') })
                      : ''
                  }
                />
              )}
            />
            <Controller
              name="preferredCurrency"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <>
                  <FormControl>
                    <InputLabel id="preferred-currency-label">
                      {t('userDetails.preferredCurrency')}
                    </InputLabel>
                    <Select
                      {...field}
                      size="small"
                      id="preferred-currency"
                      label={t('userDetails.preferredCurrency')}
                      labelId="preferred-currency-label"
                      error={fieldState.error ? true : false}
                    >
                      {currencyResponse?.map((currency) => {
                        return (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.code}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {fieldState.error && (
                      <Typography marginTop={1} fontSize={12} color="error">
                        {t('validation.required', {
                          fieldName: t('userDetails.preferredCurrency'),
                        })}
                      </Typography>
                    )}
                  </FormControl>
                </>
              )}
            />
            <Stack direction="row" width="100%" justifyContent="space-between">
              <Button disabled={isLoading} onClick={handleOnSkip} variant="contained" color="info">
                {t('userDetails.skipButton')}
              </Button>
              <Button type="submit" variant="contained" loading={isLoading}>
                {t('userDetails.okButton')}
              </Button>
            </Stack>
            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </form>
      </Stack>
    </Stack>
  );
};

export default UserDetails;
