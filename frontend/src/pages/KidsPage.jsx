import { FilteredProductPage } from "./AllProductsPage";

export function KidsPage() {
  return <FilteredProductPage cat="kids" pageTitle="Kids" showCategory={false} showSale={false} />;
}
