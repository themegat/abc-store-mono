import { createSlice } from '@reduxjs/toolkit';

import { CartDto, CartProductDto } from '../api/abcApi';

const initialState: CartDto = {
  cartProducts: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (_state, action: { payload: CartDto | null }) => {
      if (action.payload) {
        return { ...action.payload };
      } else {
        return initialState;
      }
    },
    addUpdateCartProduct: (state, action: { payload: CartProductDto }) => {
      const existingProductIndex =
        state?.cartProducts?.findIndex(
          (product) => product.productId === action.payload.productId,
        ) ?? -1;
      if (action.payload.quantity === 0 && existingProductIndex > -1) {
        return { ...state, cartProducts: state.cartProducts?.splice(existingProductIndex, 1) };
      } else if (action?.payload?.quantity && action?.payload?.quantity > 0) {
        if (existingProductIndex > -1) {
          const cartProducts = [...state.cartProducts!];
          cartProducts[existingProductIndex] = action.payload;
          return { ...state, cartProducts };
        } else {
          const cartProducts = [...state.cartProducts!];
          cartProducts.push(action.payload);
          return { ...state, cartProducts };
        }
      }
    },
  },
});

export const { setCart, addUpdateCartProduct } = cartSlice.actions;

export const selectCart = (state: { cart: CartDto }) => state.cart;
export const selectCartProduct = (state: { cart: CartDto }, id: number) =>
  state.cart?.cartProducts?.find((product) => product.productId === id);

export default cartSlice.reducer;
