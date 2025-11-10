import { createTheme, useTheme } from "@mui/material";
import { useThemeMode } from "./hooks";
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
                padding: '4.4px !important',
              },
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
            fontSize: '1.2rem',
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
