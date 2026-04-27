"use client";

import { useState, useMemo } from "react";
import { Input } from "./Input";
import { AssetsTable } from "./AssetsTable";
import { AssetsFilters } from "./AssetsFilters";
import { Pagination } from "./Pagination";
import { Search, X } from "lucide-react";

const PAGE_SIZE = 50;

interface Asset {
  id: string;
  asset_code: string;
  serial_number: string | null;
  description: string | null;
  status: string;
  condition: string;
  case_number: string | null;
  location_id: string | null;
  model_id: string | null;
  is_active: boolean;
  location?: {
    name: string;
  };
  model?: {
    name: string;
    brand: string;
    subcategory?: {
      name: string;
    };
  };
}

interface Location {
  id: string;
  name: string;
}

interface AssetsListProps {
  assets: Asset[];
  locations: Location[];
}

export function AssetsList({ assets, locations }: AssetsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        !query || 
        asset.asset_code.toLowerCase().includes(query) ||
        (asset.serial_number && asset.serial_number.toLowerCase().includes(query)) ||
        (asset.description && asset.description.toLowerCase().includes(query)) ||
        (asset.model?.brand && asset.model.brand.toLowerCase().includes(query)) ||
        (asset.model?.name && asset.model.name.toLowerCase().includes(query)) ||
        (asset.case_number && asset.case_number.toLowerCase().includes(query));
      
      const matchesStatus = !statusFilter || asset.status === statusFilter;
      const matchesCondition = !conditionFilter || asset.condition === conditionFilter;
      const matchesLocation = !locationFilter || asset.location_id === locationFilter;
      
      return matchesSearch && matchesStatus && matchesCondition && matchesLocation;
    });
  }, [assets, searchQuery, statusFilter, conditionFilter, locationFilter]);

  const totalPages = Math.ceil(filteredAssets.length / PAGE_SIZE);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setConditionFilter("");
    setLocationFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter || conditionFilter || locationFilter || searchQuery;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="w-full relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Search className="w-4 h-4 text-[#a1a1aa]" />
          </div>
          <Input
            placeholder="Search by asset code, serial number, model, description..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#a1a1aa] hover:text-[#71717a] hover:bg-[#f4f4f5] rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <AssetsFilters
            statusFilter={statusFilter}
            conditionFilter={conditionFilter}
            locationFilter={locationFilter}
            onStatusChange={(v) => { setStatusFilter(v); handleFilterChange(); }}
            onConditionChange={(v) => { setConditionFilter(v); handleFilterChange(); }}
            onLocationChange={(v) => { setLocationFilter(v); handleFilterChange(); }}
            locations={locations}
          />
          
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-[#71717a] hover:text-[#242424] underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#71717a]">
            {filteredAssets.length} {filteredAssets.length === 1 ? "asset" : "assets"}
            {hasActiveFilters && ` found`}
          </span>
        </div>
      </div>

      <AssetsTable assets={paginatedAssets} />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAssets.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}