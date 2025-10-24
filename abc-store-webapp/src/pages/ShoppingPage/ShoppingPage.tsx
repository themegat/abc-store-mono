import { useCallback, useEffect, useState } from 'react';

import { Grid2 as Grid, Stack, Typography } from '@mui/material';

import Loading from '@/components/Loading';
import ProductCard from '@/components/ProductCard';
import { MaxPrice, ProductFilter, ProductFilterChanges } from '@/components/ProductFilter';
import { config } from '@/config';
import useCurrency from '@/hooks/useCurrency';
import { ProductDto, abcApi, useGetApiProductCategoriesQuery } from '@/store/api/abcApi';

import backgroundShopImg from '../../assets/background/background_shop.webp';

const pageSize = 10;
let pageNumber = 1;
let products: ProductDto[] = [];
let inStock = true;
let categoryId = 0;
let minPrice = 0;
let maxPrice = MaxPrice;

function ShoppingPage() {
  const [fetchingProducts, setFetchingProducts] = useState(false);

  const { preferedCurrency } = useCurrency(config.preferedCurrency);

  const { data: categoriesResponse } = useGetApiProductCategoriesQuery();

  const [getProducts] = abcApi.endpoints.getApiProductFilterByCurrencyCode.useLazyQuery();

  const fetchProducts = useCallback(() => {
    setFetchingProducts(true);
    getProducts({
      currencyCode: config.preferedCurrency,
      categoryId,
      inStock,
      minPrice,
      maxPrice,
      pageNumber: pageNumber,
      pageSize,
    })
      .unwrap()
      .then((response) => {
        if (response.items && response.items.length > 0) {
          products = [...products, ...response.items];
          pageNumber++;
          setTimeout(() => {
            observer.observe(document.querySelector('#load-more') as Element);
          }, 1000);
        }
        setFetchingProducts(false);
      });
  }, [inStock, minPrice, maxPrice, categoryId]);

  const onFilterChanged = (changes: ProductFilterChanges) => {
    categoryId = changes.categoryId;
    inStock = changes.inStock;
    minPrice = changes.minPrice;
    maxPrice = changes.maxPrice;
    pageNumber = 1;
    products = [];
    fetchProducts();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          fetchProducts();
        }
      });
    },
    {
      rootMargin: '0px',
      threshold: 0.1,
    },
  );

  useEffect(() => {
    fetchProducts();
    return () => {
      observer.disconnect();
    };
  }, []);

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
            <Stack gap={5} direction="row" flexWrap="wrap">
              {products.map((item, index) => (
                <ProductCard
                  key={`product-${index}`}
                  sx={{ width: 240 }}
                  image={item?.thumbnailUrl ? item.thumbnailUrl : ''}
                  title={item.name ?? ''}
                  price={item.price ?? 0}
                  currency={preferedCurrency ?? {}}
                ></ProductCard>
              ))}
              {fetchingProducts && <Loading></Loading>}
            </Stack>
          </Grid>
          {products.length >= 10 && <Stack width={'100%'} height={20} id="load-more"></Stack>}
        </Grid>
      </Stack>
    </>
  );
}

export default ShoppingPage;
