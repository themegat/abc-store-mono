import { Stack, Typography } from '@mui/material';

import AuthComponent from '@/components/auth/AuthComponent';
import useOrientation from '@/hooks/useOrientation';

import backgroundVid from '../../assets/background/background_welcome.mp4';
import posterImg from '../../assets/background/background_welcome.webp';

function Welcome() {
  const isPortrait = useOrientation();

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
          sx={{ position: 'fixed', zIndex: 2, width: '100%', height: '100%' }}
          alignItems="center"
          marginTop={12}
        >
          <Typography margin={0} variant="h3" align="center" gutterBottom>
            Welcome to ABC Store!
          </Typography>
          <AuthComponent sx={{ width: 400 }} />
        </Stack>
      </Stack>
    </>
  );
}

export default Welcome;
