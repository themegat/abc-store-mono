import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import moment from 'moment';

import useOrder from '@/hooks/userOrder';
import { OrderDto } from '@/store/api/abcApi';
import { selectUser } from '@/store/slice/userSlice';
import { formatCurrency } from '@/utils/shopping';

type RowProps = {
  id: number;
  orderDate: string;
  status: string;
  isPaid: boolean;
  itemsOrdered: number;
  orderTotal: string;
  shipTo: string;
};

const OrderList = () => {
  const [rows, setRows] = useState<RowProps[]>([]);
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Order Number', width: 120 },
    { field: 'orderDate', headerName: 'Order Date', width: 180 },
    { field: 'status', headerName: 'Status', width: 100 },
    {
      field: 'isPaid',
      headerName: 'Paid',
      type: 'boolean',
      width: 90,
    },
    { field: 'itemsOrdered', headerName: 'Items Ordered', width: 120 },
    { field: 'orderTotal', headerName: 'Total Price', width: 130 },
    { field: 'shipTo', headerName: 'Delivery Address', width: 320 },
  ];
  const user = useSelector(selectUser);
  const { orders } = useOrder(user?.uid ?? '', 1, 100, 'Date', true);

  const getItemsOrdered = (order: OrderDto): number => {
    return order.cart?.cartProducts.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0;
  };

  const getOrderTotal = (order: OrderDto): number => {
    return (
      order.cart?.cartProducts.reduce(
        (acc, curr) => acc + curr.quantity * (curr.product?.price ?? 0),
        0,
      ) ?? 0
    );
  };

  const getShippingAddress = (order: OrderDto): string => {
    return `${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.addressLine2}, ${order.shippingAddress?.zipCode}`;
  };

  useEffect(() => {
    if (orders) {
      const mappedOrders: RowProps[] = orders.map((order) => ({
        id: order.cartId ?? 0,
        orderDate: order.orderDate ? moment(order.orderDate).format('DD-MM-YYYY HH:mm') : '',
        status: order.status ?? '',
        isPaid: order.isPaid ?? false,
        itemsOrdered: getItemsOrdered(order),
        orderTotal: formatCurrency(
          getOrderTotal(order),
          'en-US',
          user?.userDetails?.preferredCurrency ?? '',
        ),
        shipTo: getShippingAddress(order),
      }));
      setRows(mappedOrders);
    }
  }, [orders, user]);

  const paginationModel = { page: 0, pageSize: 7 };

  return (
    <Paper
      sx={{ height: 500, width: '80%', justifySelf: 'center', backgroundColor: 'transparent' }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        sx={{ border: 0, backgroundColor: 'transparent' }}
      />
    </Paper>
  );
};

export default OrderList;
