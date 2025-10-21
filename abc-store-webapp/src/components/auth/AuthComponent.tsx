import { useState } from 'react';

import { Stack, SxProps } from '@mui/material';

import { SignInAuthScreen, SignUpAuthScreen } from '@firebase-ui/react';

type Props = {
  sx?: SxProps;
};

function AuthComponent({ sx }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <>
      <meta name="title" content="Auth" />
      <Stack sx={sx}>
        {isSignUp ? (
          <SignUpAuthScreen
            onBackToSignInClick={() => {
              setIsSignUp(false);
            }}
          ></SignUpAuthScreen>
        ) : (
          <SignInAuthScreen
            onRegisterClick={() => {
              setIsSignUp(true);
            }}
            onForgotPasswordClick={() => {
              console.log('Forgot password clickd');
            }}
          />
        )}
      </Stack>
    </>
  );
}

export default AuthComponent;
