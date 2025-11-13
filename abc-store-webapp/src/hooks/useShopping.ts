import { config } from "@/config";
import { GetApiProductFilterByCurrencyCodeApiArg, ProductDto, useGetApiProductCategoriesQuery, useGetApiProductFilterByCurrencyCodeQuery } from "@/store/api/abcApi";
import { selectUser } from "@/store/slice/userSlice";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useShopping = (maxPrice: number, pageSize: number) => {
  const user = useSelector(selectUser);

  const [loadCount, setLoadCount] = useState(0);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const { data: productCategories } = useGetApiProductCategoriesQuery();
  const [productFilter, setProductFilter] = useState<GetApiProductFilterByCurrencyCodeApiArg>({
    categoryId: 0,
    inStock: true,
    minPrice: 0,
    maxPrice: maxPrice,
    pageNumber: 1,
    pageSize: pageSize,
    currencyCode: user?.userDetails?.preferredCurrency || config.preferedCurrency,
  });

  const { data: productsResponse, isLoading: fetchingProducts } =
    useGetApiProductFilterByCurrencyCodeQuery(productFilter);

  useEffect(() => {
    if (productsResponse) {
      setProducts((prods) => [...prods, ...(productsResponse.items ?? [])]);
      setLoadCount(productsResponse.totalCount ?? 0);
    }
  }, [productsResponse]);

  const loadMore = useCallback(() => {
    const pageNum = productFilter?.pageNumber ?? 1;
    setProductFilter({
      ...productFilter,
      pageNumber: pageNum + 1,
    });
  }, [productFilter, setProductFilter]);

  return {
    products,
    loadCount,
    loadMore,
    setProductFilter,
    fetchingProducts,
    setProducts,
    productCategories
  };
};

export default useShopping;