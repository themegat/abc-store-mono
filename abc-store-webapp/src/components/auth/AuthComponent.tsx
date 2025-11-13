import { useState } from 'react';

import { Stack, SxProps, useTheme } from '@mui/material';

import { SignInAuthScreen, SignUpAuthScreen } from '@firebase-ui/react';
import tinycolor from 'tinycolor2';

type Props = {
  sx?: SxProps;
};

function AuthComponent({ sx }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const theme = useTheme();

  return (
    <>
      <meta name="title" content="Auth" />
      <Stack
        sx={{
          ...sx,
          '.fui-card': {
            borderColor: theme.palette.text.primary,
            backgroundColor: tinycolor(theme.palette.background.default)
              .setAlpha(0.6)
              .toRgbString(),
            '.fui-card__title': {
              color: theme.palette.text.primary,
            },
            '.fui-card__subtitle': {
              color: theme.palette.text.secondary,
            },
            '.fui-form': {
              label: {
                color: theme.palette.text.primary,
                '.fui-form__action': {
                  color: theme.palette.text.primary,
                },
              },
              '.fui-button': {
                color: theme.palette.background.paper,
                backgroundColor: theme.palette.text.primary,
              },
              '.fui-form__action': {
                color: theme.palette.text.primary,
              },
            },
          },
        }}
      >
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
