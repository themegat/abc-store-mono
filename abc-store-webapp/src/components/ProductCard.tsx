import React, { useState } from 'react';
import { NumericFormat } from 'react-number-format';

import { Card, CardContent, CardMedia, Stack, SxProps, Typography, useTheme } from '@mui/material';

import tinycolor from 'tinycolor2';

import { ExchangeRateDto } from '@/store/api/abcApi';

type ProductCardProps = {
  image: string;
  title: string;
  price: number;
  currency: ExchangeRateDto;
  sx?: SxProps;
};

const ProductCard: React.FC<ProductCardProps> = ({ image, title, price, currency, sx }) => {
  const theme = useTheme();
  const backgroundColor = tinycolor(theme.palette.background.default).setAlpha(0.6).toRgbString();
  const [imageLoaded, setImageLoaded] = useState(false);

  const PlaceholderImage = () => {
    return (
      <CardMedia
        component="img"
        height="140"
        src="public/placeholder.png"
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
      sx={{
        ...sx,
        backgroundColor,
        '&:hover': {
          borderWidth: 1,
          borderRadius: 2,
        },
      }}
    >
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
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Stack>
          <Typography height={'-webkit-fill-available'} variant="body2" color="text.secondary">
            <NumericFormat
              readOnly
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              prefix={currency.symbol?.concat(' ')}
              value={price}
            />
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
