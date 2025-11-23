// src/components/shop/ShopComponent.jsx

import FilterSidebar from "./FilterSidebar";
import "../../styles/components/ShopComponent.css";

export default function ShopComponent({
  filters,
  onFiltersChange,
  searchValue,
  onSearchChange
}) {
  return (
    <div className="shop-filters-container">
      <FilterSidebar
        initialFilters={filters}
        onFiltersChange={onFiltersChange}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
    </div>
  );
}
