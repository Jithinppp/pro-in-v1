"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { X } from "lucide-react";
import { updateKit } from "@/lib/actions/kits";

interface Kit {
  id: string;
  name: string;
  description: string | null;
}

interface EditKitModalProps {
  kit: Kit;
  onClose: () => void;
  onSave: () => void;
}

export function EditKitModal({ kit, onClose, onSave }: EditKitModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(kit.name);
  const [description, setDescription] = useState(kit.description || "");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsLoading(true);
    setError("");
    
    const result = await updateKit(kit.id, name, description);
    
    setIsLoading(false);
    
    if (result?.error) {
      setError(result.error);
      return;
    }

    router.refresh();
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#242424]">Edit Kit</h2>
            <p className="text-sm text-[#71717a]">{kit.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#898989]" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter kit name"
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
            <Button type="button" onClick={handleSubmit} loading={isLoading} disabled={!name.trim()} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}