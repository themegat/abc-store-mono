import { ChangeEvent, SyntheticEvent, useCallback, useState } from 'react';

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
  SelectChangeEvent,
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

  const handleCategoryChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      const id = Number(event.target.value);
      setCategory(id);
      onFilterChange({ categoryId: id, inStock, minPrice, maxPrice });
    },
    [setCategory, onFilterChange, inStock, minPrice, maxPrice],
  );

  const handleInStockChange = useCallback(
    (_event: SyntheticEvent<Element, Event>, checked: boolean) => {
      setInStock(checked);
      onFilterChange({ categoryId: category, inStock: checked, minPrice, maxPrice });
    },
    [onFilterChange, category, minPrice, maxPrice],
  );

  const handleMinPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const minPrice = Number(event.target.value);
      setMinPrice(minPrice);
    },
    [],
  );

  const handleMaxPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const maxPrice = Number(event.target.value);
      setMaxPrice(maxPrice);
    },
    [],
  );

  return (
    <Paper sx={{ ...sx, borderWidth: 1, borderRadius: 1, padding: 2, backgroundColor }}>
      <FormControl fullWidth>
        <InputLabel id="category-select-label">{t('productFilter.category')}</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={category}
          label={t('productFilter.category')}
          onChange={handleCategoryChange}
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
        onChange={handleInStockChange}
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
          onChange={handleMinPriceChange}
        />
        <TextField
          label={t('productFilter.maxPrice')}
          id="max-price"
          type="number"
          defaultValue={maxPrice}
          onChange={handleMaxPriceChange}
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
