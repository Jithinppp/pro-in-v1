"use client";

import { useState, useMemo } from "react";
import { Input } from "./Input";
import { LocationsTable } from "./LocationsTable";
import { Pagination } from "./Pagination";
import { AddLocationForm } from "./AddLocationForm";
import { Search, X } from "lucide-react";

const PAGE_SIZE = 10;

interface StorageLocation {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  parent?: {
    name: string;
  };
}

interface LocationsListProps {
  locations: StorageLocation[];
}

export function LocationsList({ locations }: LocationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredLocations = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return locations.filter((location) =>
      location.name.toLowerCase().includes(query) ||
      (location.description && location.description.toLowerCase().includes(query)) ||
      (location.parent?.name && location.parent.name.toLowerCase().includes(query))
    );
  }, [locations, searchQuery]);

  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLocations.slice(start, start + PAGE_SIZE);
  }, [filteredLocations, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDelete = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
        <h2 className="text-sm font-semibold text-[#242424] mb-4">
          Add New Location
        </h2>
        <AddLocationForm refreshKey={refreshKey} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-full max-w-sm relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <Search className="w-4 h-4 text-[#a1a1aa]" />
            </div>
            <Input
              placeholder="Search locations..."
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
          <span className="text-sm text-[#71717a] whitespace-nowrap">
            {filteredLocations.length} {filteredLocations.length === 1 ? "result" : "results"}
          </span>
        </div>
        <LocationsTable locations={paginatedLocations} onDelete={handleDelete} />
        <Pagination
          currentPage={currentPage}
          totalItems={filteredLocations.length}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}