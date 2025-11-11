import { createTheme, useTheme } from '@mui/material';

import { useThemeMode } from './hooks';
import themes from './themes';

const useAbcTheme = () => {
  const { themeMode } = useThemeMode();
  const _theme = useTheme();

  const theme = createTheme({
    ...themes[themeMode],
    typography: {
      h3: {
        [_theme.breakpoints.down('sm')]: {
          fontSize: '2rem',
        },
        [_theme.breakpoints.down('md')]: {
          fontSize: '2.5rem',
        },
      },
      h4: {
        [_theme.breakpoints.down('sm')]: {
          fontSize: '1.6rem',
        },
        [_theme.breakpoints.down('md')]: {
          fontSize: '1.87rem',
        },
      },
      h6: {
        [_theme.breakpoints.down('sm')]: {
          fontSize: '1.024rem',
        },
        [_theme.breakpoints.down('md')]: {
          fontSize: '1.15rem',
        },
      },
      body1: {
        [_theme.breakpoints.between('sm', 'md')]: {
          fontSize: '1rem',
        },
      },
      body2: {
        [_theme.breakpoints.between('sm', 'md')]: {
          fontSize: '0.8rem',
        },
      },
    },
    components: {
      MuiInput: {
        styleOverrides: {
          root: {
            ':before': {
              [_theme.breakpoints.down('sm')]: {
                padding: '5.4px !important',
              },
            },
            [_theme.breakpoints.down('sm')]: {
              height: '38px',
              marginTop: '5px',
            },
            [_theme.breakpoints.up('lg')]: {
              height: '40px',
              marginTop: '5px !important',
            },
          },
          input: {
            [_theme.breakpoints.down('sm')]: {
              fontSize: '1rem',
              height: '0.5rem',
              padding: '0.5rem',
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          fontSizeMedium: {
            [_theme.breakpoints.down('sm')]: {
              fontSize: '1.2rem',
            },
            [_theme.breakpoints.down('md')]: {
              fontSize: '1.4rem',
            },
            fontSize: '1.85rem',
          },
        },
      },
    },
  });

  return {
    theme,
  };
};

export default useAbcTheme;
