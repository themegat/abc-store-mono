import { baseSplitApi as api } from "./baseApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getApiAbout: build.query<GetApiAboutApiResponse, GetApiAboutApiArg>({
      query: () => ({ url: `/api/About` }),
    }),
    getApiCart: build.query<GetApiCartApiResponse, GetApiCartApiArg>({
      query: (queryArg) => ({
        url: `/api/Cart`,
        params: {
          userId: queryArg.userId,
        },
      }),
    }),
    postApiCartCreate: build.mutation<
      PostApiCartCreateApiResponse,
      PostApiCartCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Cart/create`,
        method: "POST",
        body: queryArg.cartDto,
      }),
    }),
    putApiCartComplete: build.mutation<
      PutApiCartCompleteApiResponse,
      PutApiCartCompleteApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Cart/complete`,
        method: "PUT",
        body: queryArg.cartDto,
      }),
    }),
    deleteApiCartRemove: build.mutation<
      DeleteApiCartRemoveApiResponse,
      DeleteApiCartRemoveApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Cart/remove`,
        method: "DELETE",
        body: queryArg.cartDto,
      }),
    }),
    postApiCartProductAdd: build.mutation<
      PostApiCartProductAddApiResponse,
      PostApiCartProductAddApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Cart/product/add`,
        method: "POST",
        body: queryArg.cartProductDto,
        params: {
          cartId: queryArg.cartId,
        },
      }),
    }),
    putApiCartProductUpdate: build.mutation<
      PutApiCartProductUpdateApiResponse,
      PutApiCartProductUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Cart/product/update`,
        method: "PUT",
        body: queryArg.cartProductDto,
        params: {
          cartId: queryArg.cartId,
        },
      }),
    }),
    deleteApiCartProductRemove: build.mutation<
      DeleteApiCartProductRemoveApiResponse,
      DeleteApiCartProductRemoveApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Cart/product/remove`,
        method: "DELETE",
        body: queryArg.cartProductDto,
        params: {
          cartId: queryArg.cartId,
        },
      }),
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
    postApiOrderCreate: build.mutation<
      PostApiOrderCreateApiResponse,
      PostApiOrderCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Order/create`,
        method: "POST",
        body: queryArg.orderDto,
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
    getApiUserDetails: build.query<
      GetApiUserDetailsApiResponse,
      GetApiUserDetailsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/UserDetails`,
        params: {
          userId: queryArg.userId,
        },
      }),
    }),
    postApiUserDetailsUpdateCreate: build.mutation<
      PostApiUserDetailsUpdateCreateApiResponse,
      PostApiUserDetailsUpdateCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/UserDetails/update-create`,
        method: "POST",
        body: queryArg.userDetailsDto,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as abcApi };
export type GetApiAboutApiResponse = unknown;
export type GetApiAboutApiArg = void;
export type GetApiCartApiResponse = /** status 200 OK */ CartDto;
export type GetApiCartApiArg = {
  userId?: string;
};
export type PostApiCartCreateApiResponse = /** status 200 OK */ CartDto;
export type PostApiCartCreateApiArg = {
  cartDto: CartDto;
};
export type PutApiCartCompleteApiResponse = /** status 200 OK */ CartDto;
export type PutApiCartCompleteApiArg = {
  cartDto: CartDto;
};
export type DeleteApiCartRemoveApiResponse = /** status 200 OK */ CartDto;
export type DeleteApiCartRemoveApiArg = {
  cartDto: CartDto;
};
export type PostApiCartProductAddApiResponse =
  /** status 200 OK */ CartProductDto;
export type PostApiCartProductAddApiArg = {
  cartId?: number;
  cartProductDto: CartProductDto;
};
export type PutApiCartProductUpdateApiResponse =
  /** status 200 OK */ CartProductDto;
export type PutApiCartProductUpdateApiArg = {
  cartId?: number;
  cartProductDto: CartProductDto;
};
export type DeleteApiCartProductRemoveApiResponse =
  /** status 200 OK */ CartProductDto;
export type DeleteApiCartProductRemoveApiArg = {
  cartId?: number;
  cartProductDto: CartProductDto;
};
export type GetApiExchangeRateAllApiResponse =
  /** status 200 OK */ ExchangeRateDto[];
export type GetApiExchangeRateAllApiArg = void;
export type GetApiExchangeRateByCurrencyCodeApiResponse =
  /** status 200 OK */ ExchangeRateDto;
export type GetApiExchangeRateByCurrencyCodeApiArg = {
  currencyCode: string;
};
export type PostApiOrderCreateApiResponse = /** status 200 OK */ OrderDto;
export type PostApiOrderCreateApiArg = {
  orderDto: OrderDto;
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
export type GetApiUserDetailsApiResponse = /** status 200 OK */ UserDetailsDto;
export type GetApiUserDetailsApiArg = {
  userId?: string;
};
export type PostApiUserDetailsUpdateCreateApiResponse =
  /** status 200 OK */ UserDetailsDto;
export type PostApiUserDetailsUpdateCreateApiArg = {
  userDetailsDto: UserDetailsDto;
};
export type CartStatus = number;
export type ProductDto = {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  thumbnailUrl?: string;
  productCategory?: string | null;
  productImages?: string[] | null;
} | null;
export type CartProductDto = {
  quantity?: number;
  productId?: number;
  product?: ProductDto;
};
export type CartDto = {
  id?: number;
  userId?: string | null;
  status?: CartStatus;
  cartProducts?: CartProductDto[];
};
export type ExchangeRateDto = {
  code?: string;
  name?: string;
  rate?: number;
  symbol?: string;
};
export type OrderStatus = number;
export type AddressType = number;
export type AddressDto = {
  addressLine1?: string;
  addressLine2?: string;
  zipCode?: string;
  addressType?: AddressType;
} | null;
export type OrderDto = {
  userId?: string;
  cartId?: number;
  orderDate?: string;
  status?: OrderStatus;
  isPaid?: boolean;
  shippingAddress?: AddressDto;
};
export type ProductDto2 = {
  id?: number;
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
  items?: ProductDto2[];
};
export type ProductCategoryDto = {
  id?: number;
  name?: string;
};
export type UserDetailsDto = {
  userId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  preferredCurrency?: string | null;
  contactNumber?: string | null;
  billingAddress?: AddressDto;
};
export const {
  useGetApiAboutQuery,
  useGetApiCartQuery,
  usePostApiCartCreateMutation,
  usePutApiCartCompleteMutation,
  useDeleteApiCartRemoveMutation,
  usePostApiCartProductAddMutation,
  usePutApiCartProductUpdateMutation,
  useDeleteApiCartProductRemoveMutation,
  useGetApiExchangeRateAllQuery,
  useGetApiExchangeRateByCurrencyCodeQuery,
  usePostApiOrderCreateMutation,
  useGetApiProductFilterByCurrencyCodeQuery,
  useGetApiProductCategoriesQuery,
  useGetApiUserDetailsQuery,
  usePostApiUserDetailsUpdateCreateMutation,
} = injectedRtkApi;
