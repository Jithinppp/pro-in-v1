"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMaintenanceLog } from "@/lib/actions";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select } from "./Select";
import { Button } from "./Button";
import { Wrench, X } from "lucide-react";

interface AddMaintenanceLogModalProps {
  assetId: string;
  onClose: () => void;
}

const nextMaintenanceOptions = [
  { value: "", label: "Skip" },
  { value: "30", label: "30 days (1 month)" },
  { value: "60", label: "60 days (2 months)" },
  { value: "90", label: "90 days (3 months)" },
  { value: "180", label: "180 days (6 months)" },
  { value: "365", label: "1 year" },
];

export function AddMaintenanceLogModal({ assetId, onClose }: AddMaintenanceLogModalProps) {
  const router = useRouter();
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [technician, setTechnician] = useState("");
  const [cost, setCost] = useState("");
  const [partsReplaced, setPartsReplaced] = useState("");
  const [nextMaintenanceDays, setNextMaintenanceDays] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date().toISOString().split("T")[0];

    if (!serviceDate) {
      newErrors.serviceDate = "Service date is required";
    } else if (serviceDate > today) {
      newErrors.serviceDate = "Service date cannot be in the future";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (cost && isNaN(parseFloat(cost))) {
      newErrors.cost = "Please enter a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const nextDays = nextMaintenanceDays ? parseInt(nextMaintenanceDays) : null;

    const result = await addMaintenanceLog(
      assetId,
      serviceDate,
      description.trim(),
      technician.trim(),
      cost ? parseFloat(cost) : null,
      partsReplaced.trim(),
      nextDays
    );

    if (result?.error) {
      setErrors({ form: result.error });
      setIsSubmitting(false);
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[#242424]">Add Maintenance Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        <div className="space-y-4">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {errors.form}
            </div>
          )}

          <Input
            type="date"
            label="Service Date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            error={errors.serviceDate}
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            required
            rows={3}
            placeholder="Describe the maintenance work performed..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Technician"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              placeholder="Name"
            />
            <Input
              type="number"
              step="0.01"
              label="Cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              error={errors.cost}
              placeholder="0.00"
            />
          </div>

          <Textarea
            label="Parts Replaced"
            value={partsReplaced}
            onChange={(e) => setPartsReplaced(e.target.value)}
            rows={2}
            placeholder="List any parts that were replaced..."
          />

          <Select
            label="Schedule Next Maintenance"
            options={nextMaintenanceOptions}
            value={nextMaintenanceDays}
            onChange={setNextMaintenanceDays}
            placeholder="Select interval..."
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} loading={isSubmitting} className="flex-1">
              <Wrench className="w-4 h-4 mr-2" />
              Save Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}