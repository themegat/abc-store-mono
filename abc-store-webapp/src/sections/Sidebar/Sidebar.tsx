import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import DefaultIcon from '@mui/icons-material/Deblur';
import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SwipeableDrawer,
  Typography,
} from '@mui/material';

import { t } from 'i18next';

import { AuthContext } from '@/components/auth/AuthContext';
import useCart from '@/hooks/useCart';
import routes from '@/routes';
import { selectUser } from '@/store/slice/userSlice';

import { useSidebar } from './hooks';

type Props = {
  enabled?: boolean;
};

function Sidebar({ enabled = true }: Props) {
  const { isOpen, open, close } = useSidebar();
  const authContext = useContext(AuthContext);

  const user = useSelector(selectUser);
  const { observeCart } = useCart();

  let username = '';
  if (user) {
    if (user.firstName && user.lastName) {
      username = `${user.firstName} ${user.lastName}`;
    } else if (user.email) {
      username = user.email;
    }
  }

  const signout = () => {
    authContext.auth?.signOut().finally(() => {
      close();
    });
  };

  const showCheckout = (title: string) => {
    if (title === t('checkout.title')) {
      return observeCart?.cartProducts && observeCart.cartProducts.length > 0;
    }
    return true;
  };

  return (
    <>
      {enabled && (
        <SwipeableDrawer
          anchor="left"
          open={isOpen}
          onClose={close}
          onOpen={open}
          disableBackdropTransition={false}
          swipeAreaWidth={30}
          data-pw="sidebar"
        >
          <List sx={{ width: 250, pt: (theme) => `${theme.mixins.toolbar.minHeight}px` }}>
            {routes
              .filter((route) => route.title && route.show && showCheckout(route.title))
              .map(({ path, title, icon: Icon }) => (
                <ListItem sx={{ p: 0 }} key={path} onClick={close}>
                  <ListItemButton component={Link} to={path as string}>
                    <ListItemIcon>{Icon ? <Icon /> : <DefaultIcon />}</ListItemIcon>
                    <ListItemText>{title}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
          <Stack padding={2} textAlign="center">
            <Typography variant="subtitle1">{t('sideBar.signedInAs')}</Typography>
            <Typography variant="body1" fontWeight="bold">
              {username}
            </Typography>
            <Button
              onClick={() => {
                signout();
              }}
            >
              {t('sideBar.signOut')}
            </Button>
          </Stack>
        </SwipeableDrawer>
      )}
    </>
  );
}

export default Sidebar;
