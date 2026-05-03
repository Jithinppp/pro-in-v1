"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./Input";
import { Button } from "./Button";
import { deleteConsumable } from "@/lib/actions/consumables";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface ConsumableItem {
  id: string;
  model?: { name: string; brand: string; code: string } | null;
}

interface DeleteConsumableModalProps {
  consumable: ConsumableItem;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteConsumableModal({
  consumable,
  onClose,
  onDeleted,
}: DeleteConsumableModalProps) {
  const router = useRouter();
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const itemName = consumable.model?.name || "";

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    const result = await deleteConsumable(consumable.id, confirmName, itemName);

    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    if (onDeleted) {
      onDeleted();
    }
    onClose();
  };

  const isConfirmValid = confirmName === itemName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-[#242424]">
              Delete Consumable
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        <div className="bg-[#f4f4f5] rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-[#242424]">{itemName}</p>
          <p className="text-xs text-[#71717a]">{consumable.model?.brand} · {consumable.model?.code}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700 mb-3">
            This action cannot be undone. To confirm, type the item name below:
          </p>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={`Type "${itemName}" to confirm`}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            loading={isDeleting}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}