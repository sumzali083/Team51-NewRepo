import { FilteredProductPage } from "./AllProductsPage";

export function SalePage() {
  return <FilteredProductPage cat="sale" pageTitle="Sale" showCategory={false} showSale />;
}
