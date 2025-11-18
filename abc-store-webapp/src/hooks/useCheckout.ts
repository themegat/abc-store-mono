import { AbcExceptionResponse } from '@/error-handling/AbcExceptionResponse';
import { useToasterContext } from '@/sections/Toaster/ToasterContext';
import { OrderDto, usePostApiOrderCreateMutation } from '@/store/api/abcApi';

const useCheckout = () => {
  const [createOrderRequest, { isLoading: creatingOrder }] = usePostApiOrderCreateMutation();
  const toasterContext = useToasterContext();

  const showError = (message: string) => {
    toasterContext.setMessage(message);
    toasterContext.setSeverity('error');
    toasterContext.setOpen(true);
  };
  const createOrder = async (order: OrderDto) => {
    try {
      return await createOrderRequest({
        orderDto: order,
      }).unwrap();
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  return { createOrder, creatingOrder };
};

export default useCheckout;
