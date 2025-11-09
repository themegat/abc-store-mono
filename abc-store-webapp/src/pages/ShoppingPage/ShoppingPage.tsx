import { useCallback, useEffect, useRef, useState } from 'react';
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
import useShopping from '@/hooks/useShopping';
import { ProductDto } from '@/store/api/abcApi';
import { selectUser } from '@/store/slice/userSlice';

import backgroundShopImg from '../../assets/background/background_shop.webp';

const pageSize = 10;
const drawerWidth = 600;
const debounceDelay = 500;

const ShoppingPage = () => {
  const theme = useTheme();
  const user = useSelector(selectUser);

  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const {
    products,
    loadMore,
    loadCount,
    setProductFilter,
    fetchingProducts,
    setProducts,
    productCategories,
  } = useShopping(MaxPrice, pageSize);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && loadCount === pageSize) {
            observer.unobserve(entry.target);
            loadMore();
          }
        });
      },
      { rootMargin: '0px', threshold: 0.1 },
    );

    return () => observerRef.current?.disconnect();
  }, [loadMore, loadCount]);

  const resetLazyLoading = useCallback(
    debounce(() => {
      const moreElement = document.querySelector('#load-more');
      if (moreElement) {
        observerRef.current?.observe(moreElement);
      }
    }, debounceDelay * 2),
    [],
  );

  const setScrollObserver = useCallback(
    (itemsLoaded: number) => {
      if (itemsLoaded === pageSize) {
        resetLazyLoading();
      }
    },
    [resetLazyLoading],
  );

  const onFilterChanged = async (changes: ProductFilterChanges) => {
    setProducts([]);
    setProductFilter({
      categoryId: changes.categoryId,
      inStock: changes.inStock,
      minPrice: changes.minPrice,
      maxPrice: changes.maxPrice,
      pageNumber: 1,
      pageSize: pageSize,
      currencyCode: user?.preferredCurrency || config.preferedCurrency,
    });
  };

  useEffect(() => {
    resetLazyLoading();
  }, [resetLazyLoading, products]);

  const openProductDetails = (product: ProductDto) => {
    const moreElement = document.querySelector('#load-more');
    if (moreElement) {
      observerRef.current?.unobserve(moreElement);
    }
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
                categories={productCategories}
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
          <Stack width={'50%'} height={20} id="load-more"></Stack>
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
