import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import {
  Drawer,
  Grid2 as Grid,
  IconButton,
  Stack,
  Typography,
  debounce,
  useTheme,
} from '@mui/material';

import { t } from 'i18next';

import Loading from '@/components/Loading';
import ProductCard from '@/components/Shopping/ProductCard';
import ProductDetails from '@/components/Shopping/ProductDetails';
import { MaxPrice, ProductFilter, ProductFilterChanges } from '@/components/Shopping/ProductFilter';
import { config } from '@/config';
import { ProductDto, abcApi, useGetApiProductCategoriesQuery } from '@/store/api/abcApi';
import { selectUser } from '@/store/slice/userSlice';

import backgroundShopImg from '../../assets/background/background_shop.webp';

const pageSize = 10;
let products: ProductDto[] = [];
let pageNumber = 1;
let inStock = true;
let categoryId = 0;
let minPrice = 0;
let maxPrice = MaxPrice;
let loaded = false;
const drawerWidth = 500;
const debounceDelay = 500;

const ShoppingPage = () => {
  const theme = useTheme();
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);

  const [fetchingProducts, setFetchingProducts] = useState(false);
  const { data: categoriesResponse } = useGetApiProductCategoriesQuery();
  const [getProducts] = abcApi.endpoints.getApiProductFilterByCurrencyCode.useLazyQuery();

  const user = useSelector(selectUser);

  const fetchProducts = useCallback(async () => {
    setFetchingProducts(true);
    const response = await getProducts({
      currencyCode: user?.preferredCurrency || config.preferedCurrency,
      categoryId,
      inStock,
      minPrice,
      maxPrice,
      pageNumber: pageNumber,
      pageSize,
    }).unwrap();

    if (response.items && response.items.length > 0) {
      products = Array.from(new Set([...products, ...response.items]));
      pageNumber++;
    }
    setFetchingProducts(false);
    return response.items?.length;
  }, [getProducts, user]);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          const itemsLoaded = await fetchProducts();
          if (itemsLoaded === pageSize) {
            observer.observe(entry.target);
          }
        }
      });
    },
    {
      rootMargin: '0px',
      threshold: 0.1,
    },
  );

  const test = useCallback(
    debounce(
      () => observer.observe(document.querySelector('#load-more') as Element),
      debounceDelay * 2,
    ),
    [],
  );
  const setScrollObserver = (itemsLoaded: number) => {
    if (itemsLoaded === pageSize) {
      test();
    }
  };

  const onFilterChanged = async (changes: ProductFilterChanges) => {
    categoryId = changes.categoryId;
    inStock = changes.inStock;
    minPrice = changes.minPrice;
    maxPrice = changes.maxPrice;
    pageNumber = 1;
    products = [];
    const itemsLoaded = await fetchProducts();
    setScrollObserver(itemsLoaded ?? 0);
  };

  useEffect(() => {
    const load = async () => {
      const itemsLoaded = await fetchProducts();
      setScrollObserver(itemsLoaded ?? 0);
    };
    if (!loaded) load();
    loaded = true;

    return () => {
      observer.disconnect();
    };
  }, []);

  const openProductDetails = (product: ProductDto) => {
    observer.unobserve(document.querySelector('#load-more') as Element);
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setScrollObserver(pageSize);
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
        <Grid marginTop={10} container spacing={2}>
          <Grid size={12} textAlign="center">
            <Typography variant="h3">{t('routes.shop')}</Typography>
          </Grid>
          <Grid size={3}>
            <Stack position="sticky" top={75}>
              <Typography variant="h6" marginBottom={2}>
                {t('productFilter.title')}
              </Typography>
              <ProductFilter
                onFilterChange={onFilterChanged}
                categories={categoriesResponse}
              ></ProductFilter>
            </Stack>
          </Grid>
          <Grid size={9}>
            <Stack gap={5} direction="row" flexWrap="wrap">
              {products.map((item, index) => (
                <ProductCard
                  key={`product-${index}`}
                  id={item?.id ?? 0}
                  sx={{ width: 240 }}
                  image={item?.thumbnailUrl ? item.thumbnailUrl : ''}
                  title={item?.name ?? ''}
                  price={item?.price ?? 0}
                  stockQuantity={item?.stockQuantity ?? 0}
                  currency={user?.preferredCurrency || config.preferedCurrency}
                  onClick={() => openProductDetails(item)}
                ></ProductCard>
              ))}
              {fetchingProducts && <Loading></Loading>}
            </Stack>
          </Grid>
          {products.length >= 10 && <Stack width={'50%'} height={20} id="load-more"></Stack>}
        </Grid>
        <Drawer
          variant="temporary"
          open={Boolean(selectedProduct)}
          onClose={() => closeProductDetails()}
          anchor="right"
          sx={{
            zIndex: 0,
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              padding: 3,
              width: drawerWidth,
              height: '92vh',
              top: '8vh',
              boxSizing: 'border-box',
            },
          }}
        >
          <Stack>
            <Stack width="100%" alignItems="end">
              <IconButton
                onClick={() => closeProductDetails()}
                sx={{ width: 40 }}
                id="btn-close-product-details"
              >
                <CloseIcon />
              </IconButton>
            </Stack>
            <>
              {selectedProduct != null && (
                <ProductDetails
                  productId={selectedProduct.id ?? 0}
                  images={selectedProduct.productImages ?? []}
                  title={selectedProduct.name ?? ''}
                  price={selectedProduct.price ?? 0}
                  currency={user?.preferredCurrency || config.preferedCurrency}
                  stockQuantity={selectedProduct.stockQuantity ?? 0}
                  description={selectedProduct.description ?? ''}
                />
              )}
            </>
          </Stack>
        </Drawer>
      </Stack>
    </>
  );
};

export default ShoppingPage;
