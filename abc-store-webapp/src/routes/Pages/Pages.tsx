import { useContext, useEffect, useState } from 'react';
import { Routes } from 'react-router';

import Box from '@mui/material/Box';

import { AuthContext } from '@/components/auth/AuthContext';

import routes from '..';
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
    </Box>
  );
}

export default Pages;
