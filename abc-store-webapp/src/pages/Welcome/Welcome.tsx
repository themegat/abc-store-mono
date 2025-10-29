import { useState } from 'react';

import { Button, Stack, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';

import { t } from 'i18next';

import UserDetails from '@/components/UserDetails/Userdetails';
import AuthComponent from '@/components/auth/AuthComponent';
import useOrientation from '@/hooks/useOrientation';
import { store } from '@/store/store';

import backgroundVid from '../../assets/background/background_welcome.mp4';
import posterImg from '../../assets/background/background_welcome.webp';
import { config } from '@/config';

function Welcome() {
  const isPortrait = useOrientation();
  const [activeStep, setActiveStep] = useState(0);

  store.subscribe(() => {
    const user = store.getState().app.user;
    if (user) {
      setActiveStep(1);
    }
  });

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
            {t('title', {storeName: `${config.title}!`})}
          </Typography>
          <Button
            onClick={() => {
              if (activeStep === 0) {
                setActiveStep(1);
              } else {
                setActiveStep(0);
              }
            }}
          >
            change stepp
          </Button>
          <Stepper orientation="vertical" activeStep={activeStep}>
            <Step key={1}>
              {/* <StepLabel>Step 1</StepLabel> */}
              <StepContent>
                <AuthComponent sx={{ width: 400 }} />
              </StepContent>
            </Step>
            <Step key={2}>
              {/* <StepLabel>Step 2</StepLabel> */}
              <StepContent>
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
