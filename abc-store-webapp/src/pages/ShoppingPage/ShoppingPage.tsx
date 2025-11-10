import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Drawer,
  Grid2 as Grid,
  IconButton,
  Stack,
  Typography,
  debounce,
  useTheme,
} from '@mui/material';

import { t } from 'i18next';
import tinycolor from 'tinycolor2';

import Loading from '@/components/Loading';
import ProductCard from '@/components/Shopping/ProductCard';
import ProductDetails from '@/components/Shopping/ProductDetails';
import { MaxPrice, ProductFilter, ProductFilterChanges } from '@/components/Shopping/ProductFilter';
import { config } from '@/config';
import useDevice from '@/hooks/useDevice';
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
  const { isDesktop, isMobile, isTablet } = useDevice();

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

  const onFilterChanged = useCallback(
    async (changes: ProductFilterChanges) => {
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
    },
    [setProducts, setProductFilter, user?.preferredCurrency],
  );

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

  const FilterTitle = useCallback(() => {
    return (
      <Typography variant="h6" marginBottom={2}>
        {t('productFilter.title')}
      </Typography>
    );
  }, []);

  const Filter = useCallback(() => {
    return (
      <ProductFilter
        onFilterChange={onFilterChanged}
        categories={productCategories}
      ></ProductFilter>
    );
  }, [onFilterChanged, productCategories]);

  const DeskTopFilter = useCallback(() => {
    return (
      <Stack position="sticky" top={75}>
        <FilterTitle />
        <Filter />
      </Stack>
    );
  }, [Filter, FilterTitle]);

  const MobileFilter = useCallback(() => {
    return (
      <Accordion
        sx={{
          backgroundColor: tinycolor(theme.palette.background.default).setAlpha(0.8).toRgbString(),
        }}
      >
        <AccordionSummary
          aria-controls="product-filter"
          id="product-filter"
          expandIcon={<ExpandMoreIcon />}
        >
          <FilterTitle />
        </AccordionSummary>
        <AccordionDetails>
          <Filter />
        </AccordionDetails>
      </Accordion>
    );
  }, [Filter, FilterTitle, theme.palette.background.default]);

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
          <Grid
            sx={{
              maxWidth: isMobile ? '100%' : isTablet ? '80%' : 'unset',
              marginLeft: isMobile ? 0 : isTablet ? '10%' : 'unset',
            }}
            size={{ xs: 12, sm: 12, md: 3 }}
          >
            {isDesktop ? <DeskTopFilter /> : <MobileFilter />}
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 9 }}>
            <Stack justifyContent="center" gap={isMobile ? 1.5 : 5} direction="row" flexWrap="wrap">
              {products.map((item, index) => (
                <ProductCard
                  key={`product-${index}`}
                  id={item?.id ?? 0}
                  sx={{ width: isMobile ? 165 : 250 }}
                  image={item?.thumbnailUrl ? item.thumbnailUrl : ''}
                  title={item?.name ?? ''}
                  price={item?.price ?? 0}
                  stockQuantity={item?.stockQuantity ?? 0}
                  currency={user?.preferredCurrency || config.preferedCurrency}
                  onClick={() => openProductDetails(item)}
                  hasFocus={selectedProduct?.id === item?.id}
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
          anchor={isDesktop ? 'right' : 'bottom'}
          sx={{
            zIndex: 0,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              padding: 3,
              width: isDesktop ? drawerWidth : '100%',
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
