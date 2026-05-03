"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "./Input";
import { Button } from "./Button";
import { Select } from "./Select";
import { Package, X } from "lucide-react";
import { updateConsumable } from "@/lib/actions/consumables";
import type { Category, Subcategory, Model, Location, ConsumableItem } from "@/lib/types";

interface EditConsumableModalProps {
  consumable: ConsumableItem;
  categories: Category[];
  subcategories: Subcategory[];
  models: Model[];
  locations: Location[];
  onClose: () => void;
  onSave: () => void;
}

export function EditConsumableModal({
  consumable,
  categories,
  subcategories,
  models,
  locations,
  onClose,
  onSave,
}: EditConsumableModalProps) {
  const [selectedLocation, setSelectedLocation] = useState(consumable.location_id || "");
  const [quantity, setQuantity] = useState(consumable.quantity.toString());
  const [threshold, setThreshold] = useState(consumable.low_stock_threshold.toString());
  const [unitType, setUnitType] = useState(consumable.unit_type || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");

    const result = await updateConsumable(consumable.id, {
      location_id: selectedLocation || null,
      quantity: parseInt(quantity) || 0,
      low_stock_threshold: parseInt(threshold) || 5,
      unit_type: unitType || null,
    });

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    onSave();
    onClose();
  };

  const locationOptions = [
    { value: "", label: "Select location..." },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[#242424]">Edit Consumable</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f4f4f5] rounded-lg">
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="bg-[#f4f4f5] rounded-lg p-3">
            <p className="text-sm font-medium text-[#242424]">{consumable.model?.name}</p>
            <p className="text-xs text-[#71717a]">{consumable.model?.brand} · {consumable.model?.code}</p>
          </div>

          <Select
            label="Location"
            options={locationOptions}
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="Select location..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              required
            />
            <Input
              type="number"
              label="Low Stock Threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              min="0"
            />
          </div>

          <Input
            label="Unit Type (optional)"
            value={unitType}
            onChange={(e) => setUnitType(e.target.value)}
            placeholder="e.g., pieces, rolls, boxes"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}