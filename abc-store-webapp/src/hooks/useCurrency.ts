import { useEffect, useState } from 'react';

import { ExchangeRateDto, useGetApiExchangeRateAllQuery } from '@/store/api/abcApi';
import { store } from '@/store/store';

const useCurrency = () => {
  const { data: currencyResponse } = useGetApiExchangeRateAllQuery();
  const [supportedCurrencies, setSupportedCurrencies] = useState<ExchangeRateDto[]>([]);

  useEffect(() => {
    if (currencyResponse) {
      setSupportedCurrencies(currencyResponse);
      store.dispatch({ type: 'SET_SUPPORTED_CURRENCIES', payload: currencyResponse });
    }
  }, [currencyResponse]);

  return {
    supportedCurrencies,
  };
};

export default useCurrency;
