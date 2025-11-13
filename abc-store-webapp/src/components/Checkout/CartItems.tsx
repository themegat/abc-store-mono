import { useSelector } from 'react-redux';

import { config } from '@/config';
import { CartProductDto } from '@/store/api/abcApi';
import { selectUser } from '@/store/slice/userSlice';

import ProductCard from './ProductCard';

type Props = {
  products: CartProductDto[];
};

const CartItems = ({ products }: Props) => {
  const user = useSelector(selectUser);

  return (
    <>
      {products.map((item) => (
        <ProductCard
          key={item.productId}
          id={item?.product?.id ?? 0}
          image={item?.product?.thumbnailUrl ? item.product.thumbnailUrl : ''}
          title={item?.product?.name ?? ''}
          price={item?.product?.price ?? 0}
          stockQuantity={item?.product?.stockQuantity ?? 0}
          currency={user?.userDetails?.preferredCurrency || config.preferedCurrency}
          sx={{ marginY: 2 }}
        />
      ))}
    </>
  );
};

export default CartItems;
