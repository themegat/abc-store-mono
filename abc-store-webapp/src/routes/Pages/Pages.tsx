import { useContext, useEffect, useState } from 'react';
import { Routes } from 'react-router';

import { Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';

import { AuthContext } from '@/components/auth/AuthContext';

import routes from '..';
import packageJson from '../../../package.json';
const buildVersion = import.meta.env.VITE_BUILD_VERSION;
import { getPageHeight, renderRoutes } from './utils';

function Pages() {
  const authContext = useContext(AuthContext);
  const [defaultRoute, setDefaultRoute] = useState('/');

  useEffect(() => {
    if (authContext.user) {
      setDefaultRoute('/shopping');
    } else {
      setDefaultRoute('/');
    }
  }, [authContext]);

  return (
    <Box sx={{ height: (theme) => getPageHeight(theme) }}>
      <Routes location={defaultRoute}>{renderRoutes(routes)}</Routes>
      <footer style={{ position: 'fixed', bottom: 0, backgroundColor: 'transparent', paddingLeft: 8 }}>
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
