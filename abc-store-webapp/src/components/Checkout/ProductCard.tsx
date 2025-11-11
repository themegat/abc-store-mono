import { useState } from 'react';

import { Card, CardContent, CardMedia, Stack, SxProps, Typography, useTheme } from '@mui/material';

import { config } from '@/config';
import { formatCurrency } from '@/utils/shopping';

import placeholderImg from '../../assets/placeholder.webp';
import AddToCart from '../Shopping/AddToCart';

type Props = {
  id: number;
  image: string;
  title: string;
  price: number;
  currency: string;
  stockQuantity: number;
  sx?: SxProps;
};

const ProductCard = ({
  id,
  image,
  title,
  price,
  stockQuantity,
  currency = config.preferedCurrency,
  sx,
}: Props) => {
  const theme = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      id={`product-${id}`}
      sx={{
        ...sx,
        display: 'flex',
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${theme.palette.text.primary}`,
        borderRadius: 0,
      }}
    >
      <CardMedia
        onLoad={() => setImageLoaded(true)}
        component="img"
        sx={{ width: 151, display: imageLoaded ? 'block' : 'none' }}
        image={image}
        alt={title}
      />
      <CardMedia
        component="img"
        sx={{ width: 151, display: imageLoaded ? 'none' : 'block' }}
        image={placeholderImg}
        alt={title}
      />

      <CardContent sx={{ width: '100%' }}>
        <Stack sx={{ height: '100%' }}>
          <Typography variant="h6">{title}</Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ height: '100%', alignItems: 'end' }}
          >
            <AddToCart productId={id} maxQty={stockQuantity} />
            <Typography variant="h6" color="text.secondary">
              {formatCurrency(price, 'en-US', currency)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
