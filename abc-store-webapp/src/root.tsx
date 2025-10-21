import { ComponentType, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { initializeUI } from '@firebase-ui/core';
import { ConfigProvider } from '@firebase-ui/react';
// from MUI's toolpad we only use Notifications
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Provider as JotaiProvider } from 'jotai';

import ThemeProvider from '@/theme/Provider';

import { AuthProvider } from './components/auth/AuthContext';
import { config } from './config';
import { store } from './store/store';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const app = initializeApp(config.firebase.firebaseConfig); // Ensure Firebase app is initialized
const auth = getAuth(app); // Initialize Firebase Auth
auth.signOut();

const ui = initializeUI({ app });

function render(App: ComponentType) {
  root.render(
    <StrictMode>
      <JotaiProvider>
        <ThemeProvider>
          <Provider store={store}>
            <NotificationsProvider>
              <AuthProvider>
                <ConfigProvider ui={ui}>
                  <App />
                </ConfigProvider>
              </AuthProvider>
            </NotificationsProvider>
          </Provider>
        </ThemeProvider>
      </JotaiProvider>
    </StrictMode>,
  );
}

export { app, auth };
export default render;
