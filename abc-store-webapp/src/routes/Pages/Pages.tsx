import { useContext, useEffect, useState } from 'react';
import { Routes } from 'react-router';

import { Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';

import { AuthContext } from '@/components/auth/AuthContext';
import { UserState, selectUserState } from '@/store/slice/userSlice';

import routes from '..';
import packageJson from '../../../package.json';
import { getPageHeight, renderRoutes } from './utils';
import { useSelector } from 'react-redux';

const buildVersion = import.meta.env.VITE_BUILD_VERSION;

function Pages() {
  const authContext = useContext(AuthContext);
  const [defaultRoute, setDefaultRoute] = useState('/');
  const userState = useSelector(selectUserState);

  useEffect(() => {
    if (
      (userState && authContext.firebaseUser && userState === UserState.COMPLETE) ||
      userState === UserState.SKIPPED
    ) {
      setDefaultRoute('/shopping');
    } else {
      setDefaultRoute('/');
    }
  }, [userState]);

  return (
    <Box sx={{ height: (theme) => getPageHeight(theme) }}>
      <Routes location={defaultRoute}>{renderRoutes(routes)}</Routes>
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
