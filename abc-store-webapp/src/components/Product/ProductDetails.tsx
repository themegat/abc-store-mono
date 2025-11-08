import { Stack, Typography } from '@mui/material';

import { t } from 'i18next';

import { formatCurrency } from '@/utils/shopping';

import placeholderImg from '../../assets/placeholder.webp';
import AddToCart from './AddToCart';

type Props = {
  productId: number;
  image: string;
  title: string;
  price: number;
  currency: string;
  stockQuantity: number;
  description?: string;
};

const MinStockQuantity = 10;

const ProductDetails = ({
  productId,
  image,
  title,
  price,
  currency,
  stockQuantity,
  description,
}: Props) => {
  return (
    <Stack id={`product-${productId}`} gap={2}>
      <Stack width="100%" alignItems="center">
        <img width="80%" src={image ?? placeholderImg} alt={title} />
      </Stack>
      <Typography variant="h5" sx={{ textDecoration: 'underline' }}>
        {title}
      </Typography>
      <Typography variant="body2">{description}</Typography>
      <Typography fontSize={20} fontWeight={600} variant="body1">
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
        fontSize={18}
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
