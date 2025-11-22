import React from "react";
import FilterSidebar from "./FilterSidebar";
import "../../styles/components/ShopComponent.css";

export default function ShopComponent({
  filters,
  onFiltersChange,
  searchValue,
  onSearchChange
}) {
  return (
    <div className="shop-container">
      <FilterSidebar
        initialFilters={filters}
        onFiltersChange={onFiltersChange}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
    </div>
  );
}
