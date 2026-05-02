"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { softDeleteAsset } from "@/lib/actions";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

interface SoftDeleteModalProps {
  assetId: string;
  assetCode: string;
  onClose: () => void;
}

export function SoftDeleteModal({ assetId, assetCode, onClose }: SoftDeleteModalProps) {
  const router = useRouter();
  const [confirmCode, setConfirmCode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    const result = await softDeleteAsset(assetId, assetCode, confirmCode);

    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    router.push("/inv/assets");
  };

  const isConfirmValid = confirmCode === assetCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[#e4e4e7]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-[#242424]">Delete Asset</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              This asset will be marked as inactive and hidden from the active assets list. 
              You can restore it later from the database.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#242424] mb-2">
              Type <span className="font-mono bg-[#f4f4f5] px-2 py-0.5 rounded">{assetCode}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.toUpperCase())}
              placeholder="Type asset code..."
              className="w-full px-4 py-3 border border-[#e4e4e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#e4e4e7]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#242424] hover:bg-[#f4f4f5] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Asset
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}