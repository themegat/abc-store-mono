import { Grid2 as Grid, Stack, Typography } from '@mui/material';

import { t } from 'i18next';

import OrderList from '@/components/Order/OrderList';

import backgroundShopImg from '../../assets/background/background_shop.webp';

const Orders = () => {
  return (
    <>
      <meta name="title" content="Shop" />
      <Stack
        padding={2}
        sx={{
          backgroundImage: `url(${backgroundShopImg})`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          minHeight: '100vh',
        }}
      >
        <Grid marginTop={10} container spacing={2}>
          <Grid size={12} textAlign="center">
            <Typography variant="h3">{t('routes.orders')}</Typography>
          </Grid>
          <Grid size={12} textAlign="center">
            <OrderList />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default Orders;
