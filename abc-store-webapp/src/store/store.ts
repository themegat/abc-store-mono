import { configureStore } from '@reduxjs/toolkit';

import { abcApi } from './api/abcApi';

export const store = configureStore({
  reducer: {
    [abcApi.reducerPath]: abcApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(abcApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
