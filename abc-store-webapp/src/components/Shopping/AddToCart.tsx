import { useCallback, useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Button, IconButton, Input, Stack, SxProps, debounce } from '@mui/material';

import { t } from 'i18next';

import useCart from '@/hooks/useCart';

type Props = {
  productId: number;
  maxQty: number;
};

const buttonStyle: SxProps = {
  fontWeight: 'bold',
};

const DebounceDelay = 1000;

const AddToCart = ({ productId, maxQty }: Props) => {
  const { useObserveCartProduct, updateProduct } = useCart();
  const cartProduct = useObserveCartProduct(productId);
  const [qty, setQty] = useState<number>(cartProduct?.quantity || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQty(cartProduct?.quantity || 0);
  }, [cartProduct]);

  const updateProductQtyDebounced = useCallback(
    debounce(async (quantity: number) => {
      setLoading(true);
      if (cartProduct) {
        await updateProduct(cartProduct.productId!, quantity);
        setLoading(false);
      } else {
        await updateProduct(productId, quantity);
        setLoading(false);
      }
    }, DebounceDelay),
    [],
  );

  const increaseQty = async () => {
    if (qty <= maxQty) {
      const newQty = qty + 1;
      await updateProductQtyDebounced(newQty);
      setQty(newQty);
    }
  };

  const decreaseQty = async () => {
    if (qty > 0) {
      const newQty = qty - 1;
      await updateProductQtyDebounced(newQty);
      setQty(newQty);
    }
  };

  const remove = async () => {
    setLoading(true);
    await updateProductQtyDebounced(0);
    setQty(0);
  };

  return (
    <Stack>
      {qty > 0 ? (
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={remove}
            disabled={loading}
            id={`product-qty-remove-button-${productId}`}
            sx={{ ...buttonStyle, mt: 1 }}
          >
            <DeleteIcon />
          </IconButton>
          <Input
            id={`product-qty-input-${productId}`}
            type="number"
            value={qty}
            readOnly
            startAdornment={
              <IconButton
                id="product-qty-decrease-button"
                sx={buttonStyle}
                disabled={loading}
                onClick={() => decreaseQty()}
              >
                <RemoveIcon />
              </IconButton>
            }
            endAdornment={
              <IconButton
                id="product-qty-increase-button"
                sx={buttonStyle}
                disabled={qty >= maxQty || loading}
                onClick={() => increaseQty()}
              >
                <AddIcon />
              </IconButton>
            }
            sx={{
              width: 150,
              fontWeight: 'bold',
              input: {
                textAlign: 'center',
              },
              '::before': {
                border: '1px solid rgba(255, 255, 255, 0.7);',
                borderRadius: 1,
                padding: 0.8,
              },
              '&.hover': {
                border: '2px solid rgba(255, 255, 255, 0.7);',
              },
            }}
          />
        </Stack>
      ) : (
        <Button
          id={`add-to-cart-button-${productId}`}
          onClick={() => increaseQty()}
          disabled={loading || maxQty === 0}
          endIcon={<ShoppingCartIcon />}
          variant="outlined"
          size="medium"
        >
          {t('cart.addToCart')}
        </Button>
      )}
    </Stack>
  );
};

export default AddToCart;
