import { ExchangeRateDto } from './api/abcApi';

export enum UserState {
  PENDING,
  COMPLETE,
  SKIPPED,
}

export type User = {
  accessToken: string;
  uid: string;
  email: string;
  state: UserState | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  preferredCurrency: string | undefined;
};

type AppStoreType = {
  supportedCurrencies: ExchangeRateDto[];
  user: User | null;
};

const initialState: AppStoreType = {
  supportedCurrencies: [],
  user: null,
};

export const appReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'SET_SUPPORTED_CURRENCIES':
      return { ...state, supportedCurrencies: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};
