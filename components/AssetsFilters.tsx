"use client";

import { Select } from "./Select";

interface AssetsFiltersProps {
  statusFilter: string;
  conditionFilter: string;
  locationFilter: string;
  onStatusChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  locations: { id: string; name: string }[];
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "OUT", label: "Out" },
  { value: "PENDING_QC", label: "Pending QC" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "QUARANTINED", label: "Quarantined" },
];

const conditionOptions = [
  { value: "", label: "All Conditions" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

export function AssetsFilters({
  statusFilter,
  conditionFilter,
  locationFilter,
  onStatusChange,
  onConditionChange,
  onLocationChange,
  locations,
}: AssetsFiltersProps) {
  const locationOptions = [
    { value: "", label: "All Locations" },
    ...locations.map((loc) => ({ value: loc.id, label: loc.name })),
  ];

  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-40">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusChange}
          placeholder="Status"
        />
      </div>
      <div className="w-40">
        <Select
          options={conditionOptions}
          value={conditionFilter}
          onChange={onConditionChange}
          placeholder="Condition"
        />
      </div>
      <div className="w-48">
        <Select
          options={locationOptions}
          value={locationFilter}
          onChange={onLocationChange}
          placeholder="Location"
        />
      </div>
    </div>
  );
}