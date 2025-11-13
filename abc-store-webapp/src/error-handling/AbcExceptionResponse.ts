export type AbcExceptionResponse = {
  status: number;
  data: {
    StatusCode: number;
    Message: string;
    Details?: string;
  };
};
