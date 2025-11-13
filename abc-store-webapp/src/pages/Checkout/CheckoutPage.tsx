import { Box, Grid2 as Grid, Stack, Typography, useTheme } from '@mui/material';

import { t } from 'i18next';
import tinycolor from 'tinycolor2';

import CartItems from '@/components/Checkout/CartItems';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import useCart from '@/hooks/useCart';

import backgroundImg from '../../assets/background/background_checkout.webp';

type DividerElementProps = {
  orientation: 'horizontal' | 'vertical';
};
const DividerElement = ({ orientation }: DividerElementProps) => {
  const theme = useTheme();
  return (
    <>
      {orientation === 'vertical' ? (
        <Box sx={{ backgroundColor: theme.palette.text.primary, width: '1px', height: '100%' }} />
      ) : (
        <Box
          marginY={5}
          sx={{ backgroundColor: theme.palette.text.primary, height: '1px', width: '100%' }}
        />
      )}
    </>
  );
};

const CheckoutPage = () => {
  const { observeCart } = useCart();
  const theme = useTheme();
  return (
    <>
      <meta name="title" content={t('checkout.title')} />
      <Stack
        paddingY={5}
        paddingX={10}
        sx={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          minHeight: '100vh',
        }}
      >
        <Stack marginTop={10} spacing={2} textAlign="center">
          <Typography variant="h3">{t('checkout.title')}</Typography>
        </Stack>
        <Grid
          container
          size={12}
          marginTop={5}
          sx={{
            backgroundColor: tinycolor(theme.palette.background.default)
              .setAlpha(0.6)
              .toRgbString(),
            borderRadius: 2,
            padding: 5,
            border: `1px solid ${theme.palette.text.primary}`,
          }}
        >
          <Grid size={5} spacing={10}>
            <Typography variant="h5">{t('cart.title')}</Typography>
            <CartItems products={observeCart?.cartProducts ?? []} />
          </Grid>
          <Grid size={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <DividerElement orientation="vertical" />
          </Grid>

          <Grid size={6}>
            <CheckoutSteps />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default CheckoutPage;
