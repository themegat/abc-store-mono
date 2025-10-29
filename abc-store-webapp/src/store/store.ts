import { configureStore } from '@reduxjs/toolkit';

import { abcApi } from './api/abcApi';
import { appReducer } from './app-reducer';

export const store = configureStore({
  reducer: {
    [abcApi.reducerPath]: abcApi.reducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(abcApi.middleware),
  devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
