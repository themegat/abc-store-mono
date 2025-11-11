import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Routes, useLocation, useNavigate } from 'react-router';

import { Stack, Typography, debounce } from '@mui/material';
import Box from '@mui/material/Box';

import { AuthContext } from '@/components/auth/AuthContext';
import { UserState, selectUserState } from '@/store/slice/userSlice';

import routes from '..';
import packageJson from '../../../package.json';
import { getPageHeight, renderRoutes } from './utils';

const buildVersion = import.meta.env.VITE_BUILD_VERSION;

function Pages() {
  const authContext = useContext(AuthContext);
  const userState = useSelector(selectUserState);
  const navigate = useNavigate();
  const location = useLocation();

  const gotoShopping = debounce(() => {
    navigate('/shopping');
  }, 100);

  const goToWelcome = debounce(() => {
    navigate('/');
  }, 100);

  useEffect(() => {
    if (
      (userState && authContext.firebaseUser && userState === UserState.COMPLETE) ||
      userState === UserState.SKIPPED
    ) {
      if (location.pathname === '/') {
        gotoShopping();
      }
    } else {
      goToWelcome();
    }
  }, [userState, authContext.firebaseUser, goToWelcome, gotoShopping, location.pathname]);

  return (
    <Box sx={{ height: (theme) => getPageHeight(theme) }}>
      <Routes>{renderRoutes(routes)}</Routes>
      <footer
        style={{ position: 'fixed', bottom: 0, backgroundColor: 'transparent', paddingLeft: 8 }}
      >
        <Stack direction="row" gap={1}>
          <Typography>
            <small>Version: {packageJson.version}</small>
          </Typography>
          <Typography>
            <small>Build: {buildVersion}</small>
          </Typography>
        </Stack>
      </footer>
    </Box>
  );
}

export default Pages;
