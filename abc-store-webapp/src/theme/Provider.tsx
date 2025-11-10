import { ThemeProvider } from '@mui/material/styles';

import type { CustomThemeProviderProps } from './types';
import useAbcTheme from './useAbcTheme';

function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  const { theme } = useAbcTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default CustomThemeProvider;
