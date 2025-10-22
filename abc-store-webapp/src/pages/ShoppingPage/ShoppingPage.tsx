import { useState } from 'react';

import { Grid2 as Grid, Stack, Typography } from '@mui/material';

import Loading from '@/components/Loading';
import ProductCard from '@/components/ProductCard';
import { MaxPrice, ProductFilter, ProductFilterChanges } from '@/components/ProductFilter';
import { config } from '@/config';
import useCurrency from '@/hooks/useCurrency';
import {
  useGetApiProductCategoriesQuery,
  useGetApiProductFilterByCurrencyCodeQuery,
} from '@/store/api/abcApi';

import backgroundShopImg from '../../assets/background/background_shop.webp';

function ShoppingPage() {
  const [categoryId, setCategoryId] = useState(0);
  const [inStock, setInStock] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MaxPrice);

  const { preferedCurrency } = useCurrency(config.preferedCurrency);

  const { data: products, isFetching: fetchingProducts } =
    useGetApiProductFilterByCurrencyCodeQuery({
      currencyCode: config.preferedCurrency,
      categoryId,
      inStock,
      minPrice,
      maxPrice,
    });
  const { data: categoriesResponse } = useGetApiProductCategoriesQuery();

  const onFilterChanged = (changes: ProductFilterChanges) => {
    setCategoryId(changes.categoryId);
    setInStock(changes.inStock);
    setMinPrice(changes.minPrice);
    setMaxPrice(changes.maxPrice);
  };

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
        <Grid container spacing={2}>
          <Grid size={12} textAlign="center">
            <Typography variant="h3">Shop</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h6" marginBottom={2}>
              Filter Products
            </Typography>
            <ProductFilter
              onFilterChange={onFilterChanged}
              categories={categoriesResponse}
            ></ProductFilter>
          </Grid>
          <Grid size={9}>
            {fetchingProducts ? (
              <Loading></Loading>
            ) : (
              <Stack gap={5} direction="row" flexWrap="wrap">
                {products?.items?.map((item, index) => (
                  <ProductCard
                    key={`product-${index}`}
                    sx={{ width: 240 }}
                    image={item?.thumbnailUrl ? item.thumbnailUrl : ''}
                    title={item.name ?? ''}
                    price={item.price ?? 0}
                    currency={preferedCurrency ?? {}}
                  ></ProductCard>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

export default ShoppingPage;
