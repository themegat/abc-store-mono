import { JSX, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import {
  Button,
  Checkbox,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';

import { t } from 'i18next';

import useCart from '@/hooks/useCart';
import useCheckout from '@/hooks/useCheckout';
import useUserDetails from '@/hooks/useUserDetails';
import { OrderDto, UserDetailsDto } from '@/store/api/abcApi';
import { selectUser, setUser } from '@/store/slice/userSlice';

import AddressDetails, { AddressDetailsFormInputs } from '../UserDetails/AddressDetails';
import BasicDetails, {
  BasicDetailsFormInputs,
  BasicDetailsFormType,
} from '../UserDetails/BasicDetails';

export type StepProps = {
  label: string | JSX.Element;
  element: JSX.Element;
};

const CheckoutSteps = () => {
  const user = useSelector(selectUser);
  const [activeStep, setActiveStep] = useState(0);
  const [shippingAddressSameAsBilling, setShippingAddressSameAsBilling] = useState(false);
  const { createUpdateUser, userUpdating } = useUserDetails();
  const { completeCartCheckout, cartCompleting, observeCart } = useCart();
  const { createOrder, creatingOrder } = useCheckout();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    control: basicDetailsControl,
    setValue: setBasicDetailsValues,
    formState: basicDetailsFormState,
    trigger: triggerBasicDetails,
    getValues: basicDetailsValues,
  } = useForm<BasicDetailsFormInputs>({
    defaultValues: {
      firstName: user?.userDetails?.firstName || '',
      lastName: user?.userDetails?.lastName || '',
      emailAddress: user?.email || '',
      contactNumber: user?.userDetails?.contactNumber || '',
      preferredCurrency: user?.userDetails?.preferredCurrency || '',
    },
  });

  const {
    control: billingAddressDetailsControl,
    setValue: setBillingAddressDetailsValue,
    trigger: triggerBillingAddressDetails,
    formState: billingAddressDetailsFormState,
    getValues: billingAddressDetailsValues,
  } = useForm<AddressDetailsFormInputs>({
    defaultValues: {
      streetNumber: user?.userDetails?.billingAddress?.addressLine1 || '',
      suburb: user?.userDetails?.billingAddress?.addressLine2 || '',
      areaCode: user?.userDetails?.billingAddress?.zipCode || '',
    },
  });

  const {
    control: shippingAddressDetailsControl,
    setValue: setShippingAddressDetailsValue,
    trigger: triggerShippingAddressDetails,
    formState: shippingAddressDetailsFormState,
    getValues: shippingAddressDetailsValues,
  } = useForm<AddressDetailsFormInputs>({
    defaultValues: {
      streetNumber: '',
      suburb: '',
      areaCode: '',
    },
  });

  const steps: StepProps[] = useMemo(
    () => [
      {
        label: t('checkout.customerDetails'),
        element: (
          <BasicDetails
            id="customer-details"
            formType={BasicDetailsFormType.CHECKOUT}
            control={basicDetailsControl}
            setValue={setBasicDetailsValues}
            trigger={triggerBasicDetails}
          />
        ),
      },
      {
        label: t('address.billingAddress'),
        element: (
          <AddressDetails
            id="billing-address"
            control={billingAddressDetailsControl}
            setValue={setBillingAddressDetailsValue}
            trigger={triggerBillingAddressDetails}
          />
        ),
      },
      {
        label: (
          <Stack gap={2} direction="row" alignItems="center">
            <Typography variant="h5">{t('address.shippingAddress')}</Typography>
            {activeStep === 2 && (
              <Stack direction="row" alignItems="center">
                <Typography>{t('checkout.sameAsBilling')}</Typography>
                <Checkbox onChange={(e) => setShippingAddressSameAsBilling(e.target.checked)} />
              </Stack>
            )}
          </Stack>
        ),
        element: (
          <AddressDetails
            id="shipping-address"
            control={shippingAddressDetailsControl}
            setValue={setShippingAddressDetailsValue}
            trigger={triggerShippingAddressDetails}
          />
        ),
      },
    ],
    [
      activeStep,
      basicDetailsControl,
      billingAddressDetailsControl,
      setBasicDetailsValues,
      setBillingAddressDetailsValue,
      setShippingAddressDetailsValue,
      shippingAddressDetailsControl,
      triggerBasicDetails,
      triggerBillingAddressDetails,
      triggerShippingAddressDetails,
    ],
  );

  useEffect(() => {
    setIsLoading(userUpdating || cartCompleting || creatingOrder);
  }, [userUpdating, cartCompleting, creatingOrder]);

  const handleCreateOrder = async () => {
    if (shippingAddressDetailsValues()) {
      const orderDto: OrderDto = {
        userId: user?.uid ?? '',
        isPaid: false,
        cartId: observeCart.id ?? 0,
        shippingAddress: {
          addressLine1: shippingAddressDetailsValues().streetNumber,
          addressLine2: shippingAddressDetailsValues().suburb,
          zipCode: shippingAddressDetailsValues().areaCode,
          addressType: 'BILLING',
        },
      };
      return await createOrder(orderDto);
    }
    return undefined;
  };

  const handleCreateUpdateUserDetails = async () => {
    if (basicDetailsValues() && billingAddressDetailsValues() && user) {
      const userDto: UserDetailsDto = {
        userId: user?.uid ?? '',
        firstName: basicDetailsValues().firstName,
        lastName: basicDetailsValues().lastName,
        contactNumber: basicDetailsValues().contactNumber,
        preferredCurrency: user?.userDetails?.preferredCurrency ?? '',
        billingAddress: {
          addressLine1: billingAddressDetailsValues().streetNumber,
          addressLine2: billingAddressDetailsValues().suburb,
          zipCode: billingAddressDetailsValues().areaCode,
          addressType: 'BILLING',
        },
      };
      const result = await createUpdateUser(userDto);
      dispatch(
        setUser({
          ...user,
          userDetails: userDto,
        }),
      );
      return result;
    }
    return undefined;
  };

  const handleCompleteCheckout = async () => {
    const userResult = await handleCreateUpdateUserDetails();
    if (userResult) {
      const orderResult = await handleCreateOrder();
      if (orderResult) {
        const cartResult = await completeCartCheckout(observeCart);
        if (cartResult) {
          navigate('/shopping');
        }
      }
    }
  };

  useEffect(() => {
    if (shippingAddressSameAsBilling) {
      setShippingAddressDetailsValue('streetNumber', billingAddressDetailsValues().streetNumber);
      setShippingAddressDetailsValue('suburb', billingAddressDetailsValues().suburb);
      setShippingAddressDetailsValue('areaCode', billingAddressDetailsValues().areaCode);
    } else {
      setShippingAddressDetailsValue('streetNumber', '');
      setShippingAddressDetailsValue('suburb', '');
      setShippingAddressDetailsValue('areaCode', '');
    }
  }, [shippingAddressSameAsBilling, setShippingAddressDetailsValue, billingAddressDetailsValues]);

  const nextStep = async () => {
    if (activeStep === 0) {
      triggerBasicDetails();
      if (basicDetailsFormState.isValid === true) {
        setActiveStep(1);
      }
    } else if (activeStep === 1) {
      triggerBillingAddressDetails();
      if (billingAddressDetailsFormState.isValid === true) {
        setActiveStep(2);
      }
    } else if (activeStep === 2) {
      triggerShippingAddressDetails();
      if (shippingAddressDetailsFormState.isValid === true) {
        handleCompleteCheckout();
      }
    }
  };

  const previousStep = () => {
    setActiveStep((prevStep) => (prevStep > 0 ? prevStep - 1 : prevStep));
  };

  return (
    <>
      <Stepper orientation="vertical" activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>
              <Typography variant="h5">{step.label}</Typography>
            </StepLabel>
            <StepContent
              sx={{
                marginY: 2,
              }}
            >
              {step.element}
              <br></br>
              <Stack gap={2} direction="row">
                {activeStep < steps.length - 1 && (
                  <Button variant="contained" size="large" color="primary" onClick={nextStep}>
                    {t('checkout.next')}
                  </Button>
                )}
                {activeStep === steps.length - 1 && (
                  <Button
                    disabled={isLoading}
                    loading={isLoading}
                    loadingPosition="start"
                    variant="contained"
                    size="large"
                    color="primary"
                    onClick={nextStep}
                  >
                    {t('checkout.complete')}
                  </Button>
                )}
                {activeStep > 0 && (
                  <Button
                    disabled={isLoading}
                    variant="contained"
                    size="large"
                    color="inherit"
                    onClick={previousStep}
                  >
                    {t('checkout.previous')}
                  </Button>
                )}
              </Stack>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </>
  );
};

export default CheckoutSteps;
