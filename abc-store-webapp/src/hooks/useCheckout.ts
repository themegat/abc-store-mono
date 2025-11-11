import { OrderDto, usePostApiOrderCreateMutation } from '@/store/api/abcApi';

const useCheckout = () => {
  const [createOrderRequest, { isLoading: creatingOrder }] = usePostApiOrderCreateMutation();

  const createOrder = async (order: OrderDto) => {
    return await createOrderRequest({
      orderDto: order,
    }).unwrap();
  };

  return { createOrder, creatingOrder };
};

export default useCheckout;
