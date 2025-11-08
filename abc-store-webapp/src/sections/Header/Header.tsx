import { useMemo } from 'react';

import ThemeIcon from '@mui/icons-material/InvertColors';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  AppBar,
  Badge,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { t } from 'i18next';

import { config } from '@/config';
import useCart from '@/hooks/useCart';
import { useHotKeysDialog } from '@/sections/HotKeys/hooks';
import { useSidebar } from '@/sections/Sidebar/hooks';
import { useThemeMode } from '@/theme';

import headerBackgroundDarkImg from '../../assets/background/header_background_dark.svg';
import headerBackgroundLightImg from '../../assets/background/header_background_light.svg';
import { HotKeysButton } from './styled';

type Props = {
  enabledSidebar?: boolean;
};

const CartButton = () => {
  const { observeCart } = useCart();

  const show = useMemo(
    () => observeCart && observeCart.cartProducts && observeCart?.cartProducts?.length > 0,
    [observeCart],
  );
  const totalItems = observeCart?.cartProducts
    ?.map((item) => item.quantity)
    .reduce((prev, curr) => (prev ?? 0) + (curr ?? 0), 0);

  return (
    <>
      {show && (
        <>
          <Tooltip title={t('cart.viewCart')} arrow>
            <IconButton size="large" sx={{ display: 'grid' }}>
              <Badge
                badgeContent={totalItems}
                overlap="circular"
                sx={{ fontSize: 14 }}
                color="primary"
              ></Badge>
              <ShoppingCartIcon />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
        </>
      )}
    </>
  );
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
        position: 'fixed',
        zIndex: 500,
        backgroundImage:
          themeMode === 'dark'
            ? `url(${headerBackgroundDarkImg})`
            : `url(${headerBackgroundLightImg})`,
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
            <CartButton />
            <Tooltip title={t('hotKeys.title')} arrow>
              <HotKeysButton
                size="medium"
                variant="contained"
                aria-label="open hotkeys dialog"
                onClick={openHotKeysDialog}
              >
                {t('hotKeys.title')}
              </HotKeysButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip title={t('header.switchTheme')} arrow>
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
