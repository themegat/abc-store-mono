import { useContext } from 'react';
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

import { AuthContext } from '@/components/auth/AuthContext';
import routes from '@/routes';

import { useSidebar } from './hooks';

type Props = {
  enabled?: boolean;
};

function Sidebar({ enabled = true }: Props) {
  const { isOpen, open, close } = useSidebar();
  const authContext = useContext(AuthContext);

  const username = authContext.user?.email;

  const signout = () => {
    authContext.auth?.signOut().finally(() => {
      close();
    });
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
              .filter((route) => route.title && route.show)
              .map(({ path, title, icon: Icon }) => (
                <ListItem sx={{ p: 0 }} key={path} onClick={close}>
                  <ListItemButton component={Link} to={path as string}>
                    <ListItemIcon>{Icon ? <Icon /> : <DefaultIcon />}</ListItemIcon>
                    <ListItemText>{title}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
          <Stack padding={2} textAlign='center'>
            <Typography variant="subtitle1">Signed in as</Typography>
            <Typography variant="body1" fontWeight="bold">
              {username}
            </Typography>
            <Button
              onClick={() => {
                signout();
              }}
            >
              Sign out
            </Button>
          </Stack>
        </SwipeableDrawer>
      )}
    </>
  );
}

export default Sidebar;
