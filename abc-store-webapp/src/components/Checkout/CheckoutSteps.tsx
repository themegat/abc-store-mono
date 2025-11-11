import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

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

import { selectUser } from '@/store/slice/userSlice';

import AddressDetails, { AddressDetailsFormInputs } from '../UserDetails/AddressDetails';
import BasicDetails, { BasicDetailsFormInputs } from '../UserDetails/BasicDetails';

export type StepProps = {
  label: string | JSX.Element;
  valid: boolean;
};

const CheckoutSteps = () => {
  const user = useSelector(selectUser);
  const [activeStep, setActiveStep] = useState(0);
  const [shippingAddressSameAsBilling, setShippingAddressSameAsBilling] = useState(false);

  const [basicDetailValues, setBasicDetailValues] = useState<BasicDetailsFormInputs | undefined>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    emailAddress: user?.email ?? '',
    contactNumber: '',
  });
  const [billingAddressValues, setBillingAddressValues] = useState<
    AddressDetailsFormInputs | undefined
  >(undefined);
  const [shippingAddressValues, setShippingAddressValues] = useState<
    AddressDetailsFormInputs | undefined
  >(undefined);

  const steps: StepProps[] = useMemo(
    () => [
      {
        label: t('checkout.customerDetails'),
        valid: false,
      },
      {
        label: t('address.billingAddress'),
        valid: false,
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
        valid: false,
      },
    ],
    [activeStep],
  );

  const setStepData = useCallback(
    (index: number, valid: boolean, values?: BasicDetailsFormInputs | AddressDetailsFormInputs) => {
      steps[index].valid = valid;
      if (index === 0) {
        setBasicDetailValues(values as BasicDetailsFormInputs);
      } else if (index === 1) {
        setBillingAddressValues(values as AddressDetailsFormInputs);
      } else if (index === 2) {
        setShippingAddressValues(values as AddressDetailsFormInputs);
      }
    },
    [steps],
  );

  const completeCheckout = () => {
    console.log('completeCheckout', steps);
  };

  const stepElements: JSX.Element[] = useMemo(
    () => [
      <BasicDetails
        values={basicDetailValues}
        stepIndex={0}
        setStepData={setStepData}
        id="customer-details"
      />,
      <AddressDetails
        values={billingAddressValues}
        stepIndex={1}
        setStepData={setStepData}
        id="billing-address"
      />,
      <AddressDetails
        values={shippingAddressValues}
        stepIndex={2}
        setStepData={setStepData}
        id="shipping-address"
      />,
    ],
    [setStepData, basicDetailValues, billingAddressValues, shippingAddressValues],
  );

  useEffect(() => {
    if (shippingAddressSameAsBilling) {
      setShippingAddressValues(billingAddressValues);
    } else {
      setShippingAddressValues(undefined);
    }
  }, [shippingAddressSameAsBilling, billingAddressValues]);

  const nextStep = () => {
    if (steps[activeStep].valid) {
      setActiveStep((prevStep) => (prevStep < steps.length - 1 ? prevStep + 1 : prevStep));
    }
  };

  const previousStep = () => {
    setActiveStep((prevStep) => (prevStep > 0 ? prevStep - 1 : prevStep));
  };

  return (
    <>
      <Stepper orientation="vertical" activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step
            key={index}
            sx={{
              width: '100%',
              '.MuiStepConnector-root.MuiStepConnector-vertical': {
                display: 'none',
              },
            }}
          >
            <StepLabel
              sx={{
                display: 'flex',
                flexDirection: 'row !important',
                gap: 2,
                '.MuiStepLabel-alternativeLabel': {
                  textAlign: 'start',
                  marginTop: 0,
                },
              }}
            >
              <Typography variant="h5">{step.label}</Typography>
            </StepLabel>
            <StepContent
              sx={{
                marginY: 2,
              }}
            >
              {stepElements[index]}
              <br></br>
              <Stack gap={2} direction="row">
                {activeStep < steps.length - 1 && (
                  <Button variant="contained" size="large" color="primary" onClick={nextStep}>
                    {t('checkout.next')}
                  </Button>
                )}
                {activeStep === steps.length - 1 && (
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    onClick={completeCheckout}
                  >
                    {t('checkout.complete')}
                  </Button>
                )}
                {activeStep > 0 && (
                  <Button variant="contained" size="large" color="inherit" onClick={previousStep}>
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
