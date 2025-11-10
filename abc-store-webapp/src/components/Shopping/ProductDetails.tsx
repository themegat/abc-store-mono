import Slider from 'react-slick';

import { Stack, Typography } from '@mui/material';

import { t } from 'i18next';

import { formatCurrency } from '@/utils/shopping';

import placeholderImg from '../../assets/placeholder.webp';
import AddToCart from './AddToCart';

type Props = {
  productId: number;
  images: string[];
  title: string;
  price: number;
  currency: string;
  stockQuantity: number;
  description?: string;
};

const MinStockQuantity = 10;

const ProductDetails = ({
  productId,
  images,
  title,
  price,
  currency,
  stockQuantity,
  description,
}: Props) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    className: 'slider-carousel',
  };

  return (
    <Stack id={`product-${productId}`} gap={2}>
      <Stack width="100%" minHeight={300} alignItems="center">
        <Slider lazyLoad="ondemand" {...settings}>
          {images.length === 0 && <img width="80%" src={placeholderImg} alt={title} />}
          {images.map((imgUrl, index) => (
            <img key={index} width="80%" src={imgUrl} alt={title} />
          ))}
        </Slider>
      </Stack>
      <Typography variant="h5" sx={{ textDecoration: 'underline' }}>
        {title}
      </Typography>
      <Typography variant="body2">{description}</Typography>
      <Typography fontWeight={600} variant="h6">
        {formatCurrency(price, 'en-US', currency)}
      </Typography>
      <Typography
        color={
          stockQuantity === 0
            ? 'error'
            : stockQuantity <= MinStockQuantity
              ? 'warning'
              : 'textPrimary'
        }
        fontWeight={400}
        variant="body1"
      >
        {t('product.itemsInStock', { count: stockQuantity })}
      </Typography>
      <Stack>
        {stockQuantity > 0 && <AddToCart productId={productId} maxQty={stockQuantity} />}
      </Stack>
    </Stack>
  );
};

export default ProductDetails;
