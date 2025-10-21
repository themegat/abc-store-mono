import { Fragment, useContext, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router';

import { CssBaseline } from '@mui/material';

import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';

import { AuthContext } from './components/auth/AuthContext';
import Pages from './routes/Pages';
import Header from './sections/Header';
import HotKeys from './sections/HotKeys';
import Sidebar from './sections/Sidebar';

function App() {
  const authContext = useContext(AuthContext);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (authContext.user) {
      setSignedIn(true);
    } else {
      setSignedIn(false);
    }
  }, [authContext]);

  return (
    <Fragment>
      <CssBaseline />
      <HotKeys />
      <BrowserRouter>
        <Header enabledSidebar={signedIn} />
        <Sidebar enabled={signedIn} />
        <Pages />
      </BrowserRouter>
    </Fragment>
  );
}

const AppWithErrorHandler = withErrorHandler(App, AppErrorBoundaryFallback);
export default AppWithErrorHandler;
