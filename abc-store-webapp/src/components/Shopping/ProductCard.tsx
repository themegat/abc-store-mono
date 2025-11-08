import React, { useState } from 'react';

import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Paper,
  Stack,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';

import { t } from 'i18next';
import tinycolor from 'tinycolor2';

import { config } from '@/config';
import { formatCurrency } from '@/utils/shopping';

import placeholderImg from '../../assets/placeholder.webp';
import AddToCart from './AddToCart';

type ProductCardProps = {
  id: number;
  image: string;
  title: string;
  price: number;
  currency: string;
  stockQuantity: number;
  sx?: SxProps;
  onClick?: () => void;
};

const MinStockQuantity = 10;

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  title,
  price,
  stockQuantity,
  currency = config.preferedCurrency,
  sx,
  onClick,
}) => {
  const theme = useTheme();
  const backgroundColor = tinycolor(theme.palette.background.default).setAlpha(0.6).toRgbString();
  const [imageLoaded, setImageLoaded] = useState(false);

  const PlaceholderImage = () => {
    return (
      <CardMedia
        component="img"
        height="140"
        src={placeholderImg}
        alt={'place holder image'}
        sx={{ display: !imageLoaded ? 'block' : 'none' }}
      />
    );
  };

  const ProductImage = () => {
    return (
      <CardMedia
        onLoad={() => {
          setImageLoaded(true);
        }}
        component="img"
        height="140"
        image={image}
        alt={title}
        sx={{ display: imageLoaded ? 'block' : 'none' }}
      />
    );
  };

  const containsValidImage = () => {
    return image !== undefined && image !== null && image !== '' && image.length > 0;
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        ...sx,
        height: 'fit-content',
        backgroundColor,
        '&:hover': {
          borderWidth: 1,
          borderRadius: 2,
        },
      }}
    >
      {stockQuantity <= MinStockQuantity && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            margin: 2,
            width: 'inherit',
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor:
              stockQuantity === 0 ? theme.palette.error.main : theme.palette.warning.main,
          }}
        >
          <Typography fontSize={16} fontWeight="bold">
            {stockQuantity === 0
              ? t('product.outOfStock')
              : t('product.limitedStock', { count: stockQuantity })}
          </Typography>
        </Paper>
      )}
      {containsValidImage() ? (
        <>
          <PlaceholderImage />
          <ProductImage />
        </>
      ) : (
        <PlaceholderImage />
      )}
      <CardContent
        sx={{
          height: '-webkit-fill-available',
          display: 'inherit',
        }}
      >
        <Typography fontWeight={600} variant="body2" component="div">
          {title}
        </Typography>
        <Stack>
          <Typography variant="h6" height={'-webkit-fill-available'} color="text.secondary">
            {formatCurrency(price, 'en-US', currency)}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <AddToCart productId={id} maxQty={stockQuantity} />
      </CardActions>
    </Card>
  );
};

export default ProductCard;
