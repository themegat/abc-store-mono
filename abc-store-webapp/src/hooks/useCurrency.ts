import { useEffect, useState } from 'react';

import { ExchangeRateDto, useGetApiExchangeRateAllQuery } from '@/store/api/abcApi';

const useCurrency = (preferedCurrencyCode: string) => {
  const { data: currencyResponse } = useGetApiExchangeRateAllQuery();
  const [preferedCurrency, setPreferedCurrency] = useState<ExchangeRateDto | undefined>();
  const [supportedCurrencies, setSupportedCurrencies] = useState<ExchangeRateDto[]>([]);

  useEffect(() => {
    if (currencyResponse) {
      setSupportedCurrencies(currencyResponse);
      setPreferedCurrency(
        currencyResponse.find((currency) => currency.code === preferedCurrencyCode),
      );
    }
  }, [currencyResponse, preferedCurrencyCode]);

  return {
    preferedCurrency,
    supportedCurrencies,
  };
};

export default useCurrency;
