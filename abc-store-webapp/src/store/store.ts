import { configureStore } from '@reduxjs/toolkit';

import { abcApi } from './api/abcApi';
import appReducer from './slice/appSlice';
import cartReducer from './slice/cartSlice';
import userReducer from './slice/userSlice';

export const store = configureStore({
  reducer: {
    [abcApi.reducerPath]: abcApi.reducer,
    app: appReducer,
    user: userReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(abcApi.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
