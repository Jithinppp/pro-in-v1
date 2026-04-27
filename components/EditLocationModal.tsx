"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Textarea, Select } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

const editLocationSchema = z.object({
  parent_id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long"),
});

type EditLocationFormData = z.infer<typeof editLocationSchema>;

interface StorageLocation {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface EditLocationModalProps {
  location: StorageLocation;
  onClose: () => void;
  onSave: () => void;
}

export function EditLocationModal({ location, onClose, onSave }: EditLocationModalProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<{ id: string; parent_id: string | null; name: string }[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      setLocationsLoading(true);
      const { data } = await supabase
        .from("storage_locations")
        .select("id, parent_id, name")
        .eq("is_active", true)
        .order("name");
      if (data) setLocations(data.filter(l => l.id !== location.id));
      setLocationsLoading(false);
    }
    fetchLocations();
  }, [supabase, location.id]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditLocationFormData>({
    resolver: zodResolver(editLocationSchema),
    defaultValues: {
      parent_id: location.parent_id || undefined,
      name: location.name,
      description: location.description || "",
    },
  });

  const parentValue = watch("parent_id");

  const onSubmit = async (data: EditLocationFormData) => {
    setIsLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("storage_locations")
      .update({
        parent_id: data.parent_id || null,
        name: data.name,
        description: data.description || null,
      })
      .eq("id", location.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onSave();
    onClose();
  };

  const locationOptions = [
    { value: "", label: "No Parent (Top Level)" },
    ...locations.map((loc) => ({ value: loc.id, label: loc.name })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#242424]">Edit Location</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#898989]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            key={locations.length}
            label="Parent Location"
            options={locationOptions}
            value={parentValue || location.parent_id || ""}
            onChange={(value) => setValue("parent_id", value || undefined)}
            placeholder="Select parent location"
            loading={locationsLoading}
          />

          <Input
            {...register("name")}
            label="Name"
            error={errors.name?.message}
          />

          <Textarea
            {...register("description")}
            label="Description"
            rows={3}
            error={errors.description?.message}
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}