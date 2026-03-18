import { FilteredProductPage } from "./AllProductsPage";

export function MensPage() {
  return <FilteredProductPage cat="men" pageTitle="Mens" showCategory={false} showSale={false} />;
}
