import { baseSplitApi as api } from "./baseApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getApiAbout: build.query<GetApiAboutApiResponse, GetApiAboutApiArg>({
      query: () => ({ url: `/api/About` }),
    }),
    getApiExchangeRateAll: build.query<
      GetApiExchangeRateAllApiResponse,
      GetApiExchangeRateAllApiArg
    >({
      query: () => ({ url: `/api/ExchangeRate/all` }),
    }),
    getApiExchangeRateByCurrencyCode: build.query<
      GetApiExchangeRateByCurrencyCodeApiResponse,
      GetApiExchangeRateByCurrencyCodeApiArg
    >({
      query: (queryArg) => ({
        url: `/api/ExchangeRate/${queryArg.currencyCode}`,
      }),
    }),
    getApiProductFilterByCurrencyCode: build.query<
      GetApiProductFilterByCurrencyCodeApiResponse,
      GetApiProductFilterByCurrencyCodeApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Product/filter/${queryArg.currencyCode}`,
        params: {
          pageNumber: queryArg.pageNumber,
          pageSize: queryArg.pageSize,
          searchTerm: queryArg.searchTerm,
          categoryId: queryArg.categoryId,
          minPrice: queryArg.minPrice,
          maxPrice: queryArg.maxPrice,
          inStock: queryArg.inStock,
        },
      }),
    }),
    getApiProductCategories: build.query<
      GetApiProductCategoriesApiResponse,
      GetApiProductCategoriesApiArg
    >({
      query: () => ({ url: `/api/Product/categories` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as abcApi };
export type GetApiAboutApiResponse = unknown;
export type GetApiAboutApiArg = void;
export type GetApiExchangeRateAllApiResponse =
  /** status 200 OK */ ExchangeRateDto[];
export type GetApiExchangeRateAllApiArg = void;
export type GetApiExchangeRateByCurrencyCodeApiResponse =
  /** status 200 OK */ ExchangeRateDto;
export type GetApiExchangeRateByCurrencyCodeApiArg = {
  currencyCode: string;
};
export type GetApiProductFilterByCurrencyCodeApiResponse =
  /** status 200 OK */ PagedResultOfProductDto;
export type GetApiProductFilterByCurrencyCodeApiArg = {
  currencyCode: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};
export type GetApiProductCategoriesApiResponse =
  /** status 200 OK */ ProductCategoryDto[];
export type GetApiProductCategoriesApiArg = void;
export type ExchangeRateDto = {
  code?: string;
  name?: string;
  rate?: number;
  symbol?: string;
};
export type ProductDto = {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  thumbnailUrl?: string;
  productCategory?: string | null;
  productImages?: string[] | null;
};
export type PagedResultOfProductDto = {
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
  items?: ProductDto[];
};
export type ProductCategoryDto = {
  id?: number;
  name?: string;
};
export const {
  useGetApiAboutQuery,
  useGetApiExchangeRateAllQuery,
  useGetApiExchangeRateByCurrencyCodeQuery,
  useGetApiProductFilterByCurrencyCodeQuery,
  useGetApiProductCategoriesQuery,
} = injectedRtkApi;
