import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Stack, Step, StepContent, Stepper, Typography } from '@mui/material';

import { t } from 'i18next';

import UserDetails from '@/components/UserDetails/Userdetails';
import AuthComponent from '@/components/auth/AuthComponent';
import { config } from '@/config';
import useDevice from '@/hooks/useDevice';
import useOrientation from '@/hooks/useOrientation';
import { selectUser } from '@/store/slice/userSlice';

import backgroundVid from '../../assets/background/background_welcome.mp4';
import posterImg from '../../assets/background/background_welcome.webp';
import icon from '../../assets/icon.png';
import { isEmpty } from '@/utils/app';

function Welcome() {
  const isPortrait = useOrientation();
  const [activeStep, setActiveStep] = useState(0);
  const user = useSelector(selectUser);

  const { isMobile, isDesktop } = useDevice();

  useEffect(() => {
    if (user && !isEmpty(user.uid)) {
      setActiveStep(1);
    }else{
      setActiveStep(0);
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
          style={{
            position: 'fixed',
            zIndex: 1,
            objectFit: 'cover',
            height: isDesktop ? 'unset' : '100%',
            opacity: 0.4,
          }}
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
          gap={!isMobile ? 5 : 2}
          flexDirection={isPortrait ? 'column' : 'row'}
          sx={{ position: 'sticky', zIndex: 2, width: '100%', height: '100%' }}
          alignItems="center"
          justifyContent="center"
          marginTop={isMobile ? 15 : 10}
        >
          <Stack alignItems="center">
            <Typography margin={0} variant="h3" align="center" gutterBottom>
              {t('title', { storeName: `${config.title}!` })}
            </Typography>
            {!isMobile && <img src={icon} alt="icon" width={isDesktop ? 300 : 200} />}
          </Stack>
          <Stepper
            orientation="vertical"
            activeStep={activeStep}
            sx={{
              '.css-1riwpzn-MuiStepContent-root': {
                marginTop: 0,
              },
              '.MuiStepContent-root': {
                border: 'none',
              },
              '.MuiStepConnector-line.MuiStepConnector-lineVertical': {
                display: 'none',
              },
            }}
          >
            <Step key={1}>
              <StepContent>
                <AuthComponent sx={{ width: 400 }} />
              </StepContent>
            </Step>
            <Step key={2}>
              <StepContent sx={{ marginTop: 0, padding: 2, minWidth: 400 }}>
                <UserDetails sx={{ marginBottom: isDesktop ? 10 : 0 , marginTop: isDesktop ? 9 : 0}}></UserDetails>
              </StepContent>
            </Step>
          </Stepper>
        </Stack>
      </Stack>
    </>
  );
}

export default Welcome;
