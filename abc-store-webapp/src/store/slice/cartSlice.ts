import { createSlice } from '@reduxjs/toolkit';

import { CartDto, CartProductDto } from '../api/abcApi';

const initialState: CartDto = {
  cartProducts: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: { payload: CartDto | null }) => {
      if (action.payload) {
        state = { ...action.payload };
      } else {
        state = initialState;
      }
      return state;
    },
    addUpdateCartProduct: (state, action: { payload: CartProductDto }) => {
      const existingProductIndex =
        state?.cartProducts?.findIndex(
          (product) => product.productId === action.payload.productId,
        ) ?? -1;
      if (action.payload.quantity === 0 && existingProductIndex > -1) {
        state.cartProducts?.splice(existingProductIndex, 1);
      } else if (action?.payload?.quantity && action?.payload?.quantity > 0) {
        if (existingProductIndex > -1) {
          state.cartProducts![existingProductIndex] = action.payload;
        } else {
          state.cartProducts?.push(action.payload);
        }
        return state;
      }
    },
  },
});

export const { setCart, addUpdateCartProduct } = cartSlice.actions;

export const selectCart = (state: { cart: CartDto }) => state.cart;
export const selectCartProduct = (state: { cart: CartDto }, id: number) =>
  state.cart?.cartProducts?.find((product) => product.productId === id);

export default cartSlice.reducer;
