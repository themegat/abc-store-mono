import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AbcExceptionResponse } from '@/error-handling/AbcExceptionResponse';
import { useToasterContext } from '@/sections/Toaster/ToasterContext';
import {
  CartDto,
  CartProductDto,
  abcApi,
  useDeleteApiCartProductRemoveMutation,
  useDeleteApiCartRemoveMutation,
  usePostApiCartCreateMutation,
  usePostApiCartProductAddMutation,
  usePutApiCartCompleteMutation,
  usePutApiCartProductUpdateMutation,
} from '@/store/api/abcApi';
import {
  addUpdateCartProduct,
  completeCart,
  selectCart,
  selectCartProduct,
  setCart,
} from '@/store/slice/cartSlice';
import { selectUser } from '@/store/slice/userSlice';
import { AppDispatch, RootState } from '@/store/store';

const useObserveCart = () => {
  return useSelector(selectCart);
};

const useCart = () => {
  const useObserveCartProduct = (productId: number) => {
    return useSelector((state: RootState) => {
      return selectCartProduct(state, productId);
    });
  };


  const dispatch = useDispatch<AppDispatch>();
  const observeCart = useObserveCart();
  const user = useSelector(selectUser);

  const [createCartRequest] = usePostApiCartCreateMutation();
  const [getCartRequest] = abcApi.endpoints.getApiCart.useLazyQuery();
  const [addCartProductRequest] = usePostApiCartProductAddMutation();
  const [updateCartProductRequest] = usePutApiCartProductUpdateMutation();
  const [removeCartProductRequest] = useDeleteApiCartProductRemoveMutation();
  const [removeCartRequest] = useDeleteApiCartRemoveMutation();
  const [completeCartRequest, { isLoading: cartCompleting }] = usePutApiCartCompleteMutation();

  const toasterContext = useToasterContext();

  useEffect(() => {
    getCartRequest({ userId: user?.uid ?? '' })
      .unwrap()
      .then((cart: CartDto) => {
        dispatch(setCart(cart));
      });
  }, [getCartRequest, dispatch, user]);

  const showError = (message: string) => {
    toasterContext.setMessage(message);
    toasterContext.setSeverity('error');
    toasterContext.setOpen(true);
  };

  const showSuccess = (message: string) => {
    toasterContext.setMessage(message);
    toasterContext.setSeverity('success');
    toasterContext.setOpen(true);
  };

  const createNewCart = async (cartProduct: CartProductDto) => {
    try {
      const cart: CartDto = {
        userId: user?.uid ?? '',
        cartProducts: [cartProduct],
        status: 'IN_PROGRESS',
      };
      const newCart = await createCartRequest({ cartDto: cart }).unwrap();
      dispatch(setCart(newCart));
      showSuccess('New cart created.');
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  const addProcuctToCart = async (cartId: number, productId: number, quantity: number) => {
    try {
      const cartProduct = await addCartProductRequest({
        cartId: cartId,
        cartProductDto: {
          productId: productId,
          quantity: quantity,
        },
      }).unwrap();
      dispatch(addUpdateCartProduct(cartProduct));
      showSuccess(`${cartProduct.product?.name} added to cart.`);
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  const removeCartProduct = async (cartId: number, productId: number) => {
    try {
      const cartProduct: CartProductDto = { productId, quantity: 0 };
      await removeCartProductRequest({
        cartId,
        cartProductDto: cartProduct,
      });
      dispatch(addUpdateCartProduct(cartProduct));
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  const removeCart = async (cartDto: CartDto) => {
    try {
      await removeCartRequest({
        userId: cartDto.userId ?? '',
      });
      dispatch(
        setCart({
          userId: cartDto.userId,
          cartProducts: [],
        }),
      );
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  const updateCartProduct = async (cartId: number, productId: number, quantity: number) => {
    try {
      const cartProduct = await updateCartProductRequest({
        cartId: cartId,
        cartProductDto: {
          productId: productId,
          quantity,
        },
      }).unwrap();
      dispatch(addUpdateCartProduct(cartProduct));
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  const updateProduct = async (productId: number, quantity: number) => {
    const newCartProduct: CartProductDto = {
      productId: productId,
      quantity: quantity,
    };

    if (!observeCart.id) {
      await createNewCart(newCartProduct);
    } else {
      const existingCartProduct = observeCart.cartProducts?.find(
        (cartProduct) => cartProduct.productId === productId,
      );
      if (existingCartProduct) {
        if (quantity === 0) {
          if (observeCart.cartProducts?.length === 1) {
            const cartDto = observeCart;
            await removeCart(cartDto);
          } else {
            await removeCartProduct(observeCart.id!, productId);
          }
        } else {
          await updateCartProduct(observeCart.id!, productId, quantity);
        }
      } else {
        await addProcuctToCart(observeCart.id!, productId, quantity);
      }
    }
  };

  const completeCartCheckout = async (cart: CartDto) => {
    try {
      const result = await completeCartRequest({
        userId: cart.userId ?? '',
      }).unwrap();
      dispatch(completeCart());
      return result;
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  return {
    useObserveCartProduct,
    updateProduct,
    observeCart,
    completeCartCheckout,
    cartCompleting,
  };
};

export default useCart;
