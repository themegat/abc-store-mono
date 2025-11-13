import { JSX, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';

import { t } from 'i18next';
import tinycolor from 'tinycolor2';

import useOrientation from '@/hooks/useOrientation';
import useUserDetails from '@/hooks/useUserDetails';
import { UserDetailsDto, useGetApiExchangeRateAllQuery } from '@/store/api/abcApi';
import { AppDispatch } from '@/store/store';

import { User, UserState, selectUser, setUser } from '../../store/slice/userSlice';
import AddressDetails, { AddressDetailsFormInputs } from './AddressDetails';
import BasicDetails, { BasicDetailsFormInputs, BasicDetailsFormType } from './BasicDetails';

type Props = {
  sx?: SxProps;
};

type Step = {
  title: string;
  component: JSX.Element;
};

const UserDetails = ({ sx }: Props) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const { data: currencyResponse } = useGetApiExchangeRateAllQuery();
  const { createUpdateUser, userUpdating } = useUserDetails();

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const isPortrait = useOrientation();

  const {
    control: basicDetailsControl,
    setValue: setBasicDetailsValues,
    formState: basicDetailsFormState,
    trigger: triggerBasicDetails,
    getValues: basicDetailsValues,
  } = useForm<BasicDetailsFormInputs>({
    defaultValues: {
      firstName: '',
      lastName: '',
      emailAddress: '',
      contactNumber: '',
      preferredCurrency: '',
    },
  });

  const {
    control: addressDetailsControl,
    setValue: setAddressDetailsValue,
    trigger: triggerAddressDetails,
    formState: addressDetailsFormState,
    getValues: addressDetailsValues,
  } = useForm<AddressDetailsFormInputs>({
    defaultValues: {
      streetNumber: '',
      suburb: '',
      areaCode: '',
    },
  });

  useEffect(() => {
    setIsLoading(userUpdating);
  }, [userUpdating]);

  const [currencyOptions, setCurrencyOptions] = useState<{ id: string; value: string }[]>([]);

  useEffect(() => {
    const options = currencyResponse?.map((currency, index) => {
      return { id: index.toString(), value: currency.code ?? '' };
    });
    setCurrencyOptions(options ?? []);
  }, [currencyResponse]);

  const handleUpdateBasicDetails = async () => {
    if (user) {
      const basicDetails = basicDetailsValues();
      const userDetailsDto: UserDetailsDto = {
        userId: user?.uid ?? '',
        firstName: basicDetails.firstName,
        lastName: basicDetails.lastName,
        contactNumber: basicDetails.contactNumber,
        preferredCurrency: basicDetails.preferredCurrency,
      };
      const result = await createUpdateUser(userDetailsDto);
      dispatch(
        setUser({
          ...user,
          userDetails: userDetailsDto,
        }),
      );
      return result;
    }
    return undefined;
  };

  const handleUpdateAddressDetails = async () => {
    if (user) {
      const addressDetails = addressDetailsValues();
      const userDetailsDto: UserDetailsDto = {
        ...user?.userDetails,
        billingAddress: {
          addressLine1: addressDetails.streetNumber,
          addressLine2: addressDetails.suburb,
          zipCode: addressDetails.areaCode,
        },
      };
      const result = await createUpdateUser(userDetailsDto);
      dispatch(
        setUser({
          ...user,
          userDetails: userDetailsDto,
          state: UserState.COMPLETE,
        }),
      );
      return result;
    }
    return undefined;
  };

  const steps = [
    {
      title: t('userDetails.basicDetails'),
      component: useMemo(
        () => (
          <BasicDetails
            id="basicDetails"
            control={basicDetailsControl}
            setValue={setBasicDetailsValues}
            trigger={triggerBasicDetails}
            currencyOptions={currencyOptions}
            formType={BasicDetailsFormType.ON_BOARDING}
          />
        ),
        [currencyOptions, basicDetailsControl, setBasicDetailsValues, triggerBasicDetails],
      ),
    },
    {
      title: t('userDetails.addressDetails'),
      component: (
        <AddressDetails
          id="addressDetails"
          control={addressDetailsControl}
          setValue={setAddressDetailsValue}
          trigger={triggerAddressDetails}
        />
      ),
    },
  ];

  const nextStep = async () => {
    if (activeStep === 0) {
      triggerBasicDetails();
      if (basicDetailsFormState.isValid == true) {
        const result = await handleUpdateBasicDetails();
        if (result) {
          setActiveStep(1);
        }
      }
    } else if (activeStep === 1) {
      triggerAddressDetails();
      if (addressDetailsFormState.isValid === true) {
        await handleUpdateAddressDetails();
      }
    }
  };

  const previousStep = () => {
    setActiveStep((prevStep) => (prevStep > 0 ? prevStep - 1 : prevStep));
  };

  const handleOnSkip = () => {
    if (user) {
      const updateUser: User = {
        ...user,
        state: UserState.COMPLETE,
      };
      dispatch(setUser(updateUser));
    }
  };

  return (
    <Stack>
      <Stack
        sx={{
          ...sx,
          borderWidth: 1,
          borderColor: theme.palette.text.primary,
          backgroundColor: tinycolor(theme.palette.background.default).setAlpha(0.6).toRgbString(),
          paddingX: 5,
          paddingY: 5,
          borderRadius: 2,
        }}
      >
        <Stack marginBottom={2} gap={1} alignItems="center">
          <Typography fontWeight={600} variant="h6">
            {t('userDetails.title')}
          </Typography>
          <Typography variant="body2">{t('userDetails.subTitle')}</Typography>
        </Stack>
        <form>
          <Stack gap={2}>
            <Stepper orientation="vertical" activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel>
                    <Typography variant="body1">{step.title}</Typography>
                  </StepLabel>
                  <StepContent>
                    {step.component}
                    <br />
                    <Stack
                      gap={2}
                      direction={isPortrait ? 'column' : 'row'}
                      width="100%"
                      justifyContent="start"
                      marginBottom={2}
                    >
                      <Button variant="contained" loading={isLoading} onClick={nextStep}>
                        {t('userDetails.okButton')}
                      </Button>
                      {activeStep > 0 && (
                        <Button
                          disabled={isLoading}
                          onClick={handleOnSkip}
                          variant="contained"
                          color="info"
                        >
                          {t('userDetails.skipButton')}
                        </Button>
                      )}
                      {activeStep > 0 && (
                        <Button disabled={isLoading} onClick={previousStep}>
                          Back
                        </Button>
                      )}
                    </Stack>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Stack>
        </form>
      </Stack>
    </Stack>
  );
};

export default UserDetails;
