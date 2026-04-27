"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Textarea, Select } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const locationSchema = z.object({
  parent_id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long"),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface StorageLocation {
  id: string;
  parent_id: string | null;
  name: string;
}

interface AddLocationFormProps {
  onSuccess?: () => void;
  refreshKey?: number;
}

export function AddLocationForm({ onSuccess, refreshKey }: AddLocationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      setLocationsLoading(true);
      const { data } = await supabase
        .from("storage_locations")
        .select("id, parent_id, name")
        .eq("is_active", true)
        .order("name");
      if (data) setLocations(data);
      setLocationsLoading(false);
    }
    fetchLocations();
  }, [supabase, refreshKey]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  const parentValue = watch("parent_id");

  const onSubmit = async (data: LocationFormData) => {
    setIsLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("storage_locations")
      .insert({
        parent_id: data.parent_id || null,
        name: data.name,
        description: data.description || null,
      });

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    reset();
    setIsLoading(false);
    router.refresh();
    
    const { data: newLocations } = await supabase
      .from("storage_locations")
      .select("id, parent_id, name")
      .eq("is_active", true)
      .order("name");
    if (newLocations) setLocations(newLocations);
    
    onSuccess?.();
  };

  const locationOptions = [
    { value: "", label: "No Parent (Top Level)" },
    ...locations.map((loc) => ({ value: loc.id, label: loc.name })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        key={locations.length}
        label="Parent Location"
        options={locationOptions}
        value={parentValue || ""}
        onChange={(value) => setValue("parent_id", value || undefined)}
        placeholder="Select parent location"
        loading={locationsLoading}
      />

      <Input
        {...register("name")}
        label="Name"
        placeholder="Warehouse A"
        error={errors.name?.message}
      />

      <Textarea
        {...register("description")}
        label="Description"
        placeholder="Optional description..."
        rows={3}
        error={errors.description?.message}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" loading={isLoading} className="w-full">
        Add Location
      </Button>
    </form>
  );
}