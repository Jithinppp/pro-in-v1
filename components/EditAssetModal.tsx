"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select } from "./Select";
import { Button } from "./Button";
import { X } from "lucide-react";

interface Asset {
  id: string;
  asset_code: string;
  serial_number: string | null;
  description: string | null;
  status: string;
  condition: string;
  case_number: string | null;
  location_id: string | null;
}

interface EditAssetModalProps {
  asset: Asset;
  onClose: () => void;
  onSave: () => void;
}

const statusOptions = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "OUT", label: "Out" },
  { value: "PENDING_QC", label: "Pending QC" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "QUARANTINED", label: "Quarantined" },
];

const conditionOptions = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

export function EditAssetModal({ asset, onClose, onSave }: EditAssetModalProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(asset.status);
  const [condition, setCondition] = useState(asset.condition);
  const [description, setDescription] = useState(asset.description || "");
  const [serialNumber, setSerialNumber] = useState(asset.serial_number || "");
  const [caseNumber, setCaseNumber] = useState(asset.case_number || "");

  const handleSubmit = async () => {
    setIsLoading(true);
    
    const { error } = await supabase
      .from("assets")
      .update({
        status,
        condition,
        description: description || null,
        serial_number: serialNumber || null,
        case_number: caseNumber || null,
      })
      .eq("id", asset.id);

    setIsLoading(false);
    
    if (!error) {
      router.refresh();
      onSave();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#242424]">Edit Asset</h2>
            <p className="text-sm text-[#71717a]">{asset.asset_code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#898989]" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
            <Select
              label="Condition"
              options={conditionOptions}
              value={condition}
              onChange={setCondition}
            />
          </div>

          <Input
            label="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="Enter serial number"
          />

          <Input
            label="Case Number"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            placeholder="Enter case number"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} loading={isLoading} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}