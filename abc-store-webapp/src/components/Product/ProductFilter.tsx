import { useState } from 'react';

import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SxProps,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Stack } from '@mui/system';

import { t } from 'i18next';
import tinycolor from 'tinycolor2';

import { GetApiProductCategoriesApiResponse } from '@/store/api/abcApi';

const MaxPrice = 100000;
class ProductFilterChanges {
  categoryId: number = 0;
  inStock: boolean = true;
  minPrice: number = 0;
  maxPrice: number = MaxPrice;
}

type Props = {
  categories: GetApiProductCategoriesApiResponse | undefined;
  onFilterChange: (changes: ProductFilterChanges) => void;
  sx?: SxProps;
};

const PricingDivider = () => {
  return <Divider sx={{ borderWidth: 1, marginTop: 2, marginBottom: 2 }}></Divider>;
};

const ProductFilter = ({ categories, onFilterChange, sx }: Props) => {
  const theme = useTheme();
  const backgroundColor = tinycolor(theme.palette.background.default).setAlpha(0.8).toRgbString();

  const [category, setCategory] = useState(0);
  const [inStock, setInStock] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MaxPrice);

  return (
    <Paper sx={{ ...sx, borderWidth: 1, borderRadius: 1, padding: 2, backgroundColor }}>
      <FormControl fullWidth>
        <InputLabel id="category-select-label">{t('productFilter.category')}</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={category}
          label={t('productFilter.category')}
          onChange={(event) => {
            const id = Number(event.target.value);
            setCategory(id);
            onFilterChange({ categoryId: id, inStock, minPrice, maxPrice });
          }}
        >
          <MenuItem value={0}>{t('productFilter.all')}</MenuItem>
          {categories?.map((item) => (
            <MenuItem value={item.id}>
              <Typography sx={{ textTransform: 'capitalize' }}>{item.name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <PricingDivider />
      <FormControlLabel
        onChange={(_event, checked) => {
          setInStock(checked);
          onFilterChange({ categoryId: category, inStock: checked, minPrice, maxPrice });
        }}
        control={<Checkbox defaultChecked />}
        label={t('productFilter.inStock')}
      />
      <PricingDivider />
      <Stack gap={2}>
        <TextField
          label={t('productFilter.minPrice')}
          id="min-price"
          type="number"
          defaultValue={minPrice}
          onChange={(event) => {
            const minPrice = Number(event.target.value);
            setMinPrice(minPrice);
          }}
        />
        <TextField
          label={t('productFilter.maxPrice')}
          id="max-price"
          type="number"
          defaultValue={maxPrice}
          onChange={(event) => {
            const maxPrice = Number(event.target.value);
            setMaxPrice(maxPrice);
          }}
        />
        <Button
          variant="contained"
          id="apply-pricing"
          onClick={() => {
            onFilterChange({ categoryId: category, inStock, minPrice, maxPrice });
          }}
        >
          {t('productFilter.btnApply')}
        </Button>
      </Stack>
      <PricingDivider />
    </Paper>
  );
};

export { ProductFilter, ProductFilterChanges, MaxPrice };
