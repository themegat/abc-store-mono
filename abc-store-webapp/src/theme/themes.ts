import { ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

import { ThemeMode } from './types';

const sharedTheme = {
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiDivider: {
      styleOverrides: {
        vertical: {
          marginRight: 10,
          marginLeft: 10,
        },
      },
    },
  },
};

// to explore all the options, check out https://mui.com/material-ui/customization/default-theme/
const themes: Record<ThemeMode, ThemeOptions> = {
  light: deepmerge(sharedTheme, {
    palette: {
      mode: 'light',
      primary: {
        main: '#FF8C42',
        light: '#FFC085',
        dark: '#CC6E2E',
      },
      secondary: {
        main: '#2B7A78',
        light: '#7BC7C2',
        dark: '#204F57',
      },
      background: {
        default: '#F6F1E9',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#24323F',
        secondary: '#5F6B7A',
      },
      divider: 'rgba(36, 50, 63, 0.12)',
    },
  }),

  dark: deepmerge(sharedTheme, {
    palette: {
      mode: 'dark',
      primary: {
        main: '#FFB369',
        light: '#FFD39A',
        dark: '#E07A32',
      },
      secondary: {
        main: '#7BC7C2',
        light: '#A3E0D7',
        dark: '#204F57',
      },
      background: {
        default: '#121418',
        paper: '#1B1F23',
      },
      text: {
        primary: '#F4F6F8',
        secondary: '#C8D0D6',
      },
      divider: 'rgba(255, 255, 255, 0.12)',
    },
  }),
};

export default themes;
