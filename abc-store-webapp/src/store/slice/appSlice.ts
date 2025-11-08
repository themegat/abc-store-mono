import { createSlice } from '@reduxjs/toolkit';

import { ExchangeRateDto } from '../api/abcApi';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    supportedCurrencies: [] as ExchangeRateDto[],
  },
  reducers: {
    setSupportedCurrencies: (sate, action: { payload: ExchangeRateDto[] }) => {
      sate.supportedCurrencies = action.payload;
    },
  },
});

export const { setSupportedCurrencies } = appSlice.actions;

export const selectSupportedCurrencies = (state: { supportedCurrencies: ExchangeRateDto[] }) => state.supportedCurrencies;

export default appSlice.reducer;
