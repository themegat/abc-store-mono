import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Stack, Step, StepContent, Stepper, Typography } from '@mui/material';

import { t } from 'i18next';

import UserDetails from '@/components/UserDetails/Userdetails';
import AuthComponent from '@/components/auth/AuthComponent';
import { config } from '@/config';
import useOrientation from '@/hooks/useOrientation';
import { selectUser } from '@/store/slice/userSlice';

import backgroundVid from '../../assets/background/background_welcome.mp4';
import posterImg from '../../assets/background/background_welcome.webp';

function Welcome() {
  const isPortrait = useOrientation();
  const [activeStep, setActiveStep] = useState(0);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user && user.accessToken && user.email) {
      setActiveStep(1);
    }
  }, [user]);
  const setPlaybackSpeed = () => {
    const element = document.querySelector('video');
    if (element) {
      element.playbackRate = 0.8;
    }
  };

  return (
    <>
      <meta name="title" content="Welcome" />
      <Stack alignItems="center">
        <video
          poster={posterImg}
          style={{ position: 'fixed', zIndex: 1, width: '100%', opacity: 0.4 }}
          autoPlay
          onLoadedData={() => {
            setPlaybackSpeed();
          }}
          muted
          loop
          id="background-video"
        >
          <source src={backgroundVid} type="video/mp4" />
        </video>
        <Stack
          flexDirection={isPortrait ? 'row' : 'column'}
          sx={{ position: 'absolute', zIndex: 2, width: '100%', height: '100%' }}
          alignItems="center"
          marginTop={12}
        >
          <Typography margin={0} variant="h3" align="center" gutterBottom>
            {t('title', { storeName: `${config.title}!` })}
          </Typography>
          <Stepper
            orientation="vertical"
            activeStep={activeStep}
            sx={{
              '.MuiStepContent-root.css-aprk75-MuiStepContent-root': {
                border: 'none',
              },
              '.MuiStepConnector-line.MuiStepConnector-lineVertical.css-2ednpa-MuiStepConnector-line':
                {
                  display: 'none',
                },
            }}
          >
            <Step key={1}>
              {/* <StepLabel>Step 1</StepLabel> */}
              <StepContent>
                <AuthComponent sx={{ width: 400 }} />
              </StepContent>
            </Step>
            <Step key={2}>
              {/* <StepLabel>Step 2</StepLabel> */}
              <StepContent sx={{ marginTop: 7 }}>
                <UserDetails></UserDetails>
              </StepContent>
            </Step>
          </Stepper>
        </Stack>
      </Stack>
    </>
  );
}

export default Welcome;
