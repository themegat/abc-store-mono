import { useEffect, useState } from 'react';

import { OrderDto, OrderSortBy, useGetApiOrderGetOrdersQuery } from '@/store/api/abcApi';

const useOrder = (
  userId: string,
  pageNumber: number,
  pageSize: number,
  orderBy: OrderSortBy,
  orderDesc = false,
) => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const { data: ordersResponse, isLoading: loadingOrders } = useGetApiOrderGetOrdersQuery({
    userId: userId,
    pageNumber: pageNumber,
    pageSize: pageSize,
    sortBy: orderBy,
    desc: orderDesc,
  });

  useEffect(() => {
    if (ordersResponse) {
      setOrders(ordersResponse.items ?? []);
    }
  }, [ordersResponse]);

  return {
    orders,
    loadingOrders,
  };
};

export default useOrder;
