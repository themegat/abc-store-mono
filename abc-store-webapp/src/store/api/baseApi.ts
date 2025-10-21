import { BaseQueryApi, createApi, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getFirebaseIdToken } from '../firebase-token-fetcher';

const baseUrl = 'https://localhost:7198/';

const firebaseAuthBaseQuery = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) => {
  const token = await getFirebaseIdToken();

  const rawBaseQuery = fetchBaseQuery({
      baseUrl: baseUrl,
      prepareHeaders: (headers) => {
          if (token) {
              headers.set('Authorization', `Bearer ${token}`);
          }
          return headers;
      },
  });

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
      console.error("Authentication Error (401) - Token invalid or expired. User should be logged out.");
  }

  return result;
};

export const baseSplitApi = createApi({
  baseQuery: firebaseAuthBaseQuery,
  endpoints: () => ({}),
})