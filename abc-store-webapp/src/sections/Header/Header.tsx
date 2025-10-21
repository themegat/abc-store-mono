import ThemeIcon from '@mui/icons-material/InvertColors';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Divider, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';

import { config } from '@/config';
import { useHotKeysDialog } from '@/sections/HotKeys/hooks';
import { useSidebar } from '@/sections/Sidebar/hooks';
import { useThemeMode } from '@/theme';

import { HotKeysButton } from './styled';

type Props = {
  enabledSidebar?: boolean;
};

function Header({ enabledSidebar = true }: Props) {
  const { themeMode, toggle: toggleThemeMode } = useThemeMode();
  const { open: openSidebar } = useSidebar();
  const { open: openHotKeysDialog } = useHotKeysDialog();

  return (
    <AppBar
      position={enabledSidebar ? 'static' : 'fixed'}
      color="transparent"
      elevation={enabledSidebar ? 2 : 0}
      data-pw={`theme-${themeMode}`}
      enableColorOnDark
      sx={{
        backgroundImage:
          themeMode === 'dark'
            ? "url('public/background/header_background_dark.svg')"
            : "url('public/background/header_background_light.svg')",
        backgroundSize: 'contain',
        paddingBottom: 1,
      }}
    >
      <Toolbar>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flex={1}>
          {enabledSidebar ? (
            <Stack direction="row" gap={1} alignItems="center">
              <IconButton
                size="large"
                edge="start"
                sx={{ color: '#fff', '.MuiSvgIcon-root': { fontSize: 30 } }}
                aria-label="menu"
                onClick={openSidebar}
              >
                <MenuIcon />
              </IconButton>
              <Typography sx={{ color: '#fff' }} fontSize={24} fontWeight="bold">
                {config.title}
              </Typography>
            </Stack>
          ) : (
            <Stack></Stack>
          )}
          <Stack direction="row" alignItems="center">
            <Tooltip title="Hot keys" arrow>
              <HotKeysButton
                size="medium"
                variant="contained"
                aria-label="open hotkeys dialog"
                onClick={openHotKeysDialog}
              >
                Hot Keys
              </HotKeysButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Switch theme" arrow>
              <IconButton
                color="default"
                edge="end"
                size="large"
                sx={{ fontSize: 50, '.MuiSvgIcon-root': { fontSize: 30 } }}
                onClick={toggleThemeMode}
                data-pw="theme-toggle"
              >
                <ThemeIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
