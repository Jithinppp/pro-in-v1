"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Select, Textarea } from "@/components";
import Link from "next/link";

const assetSchema = z.object({
  model_id: z.string().min(1, "Model is required"),
  supplier_id: z.string().optional(),
  serial_number: z.string().optional(),
  description: z.string().optional(),
  weight: z.string().optional(),
  invoice_number: z.string().optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "OUT", "PENDING_QC", "MAINTENANCE", "QUARANTINED"]),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  location_id: z.string().min(1, "Location is required"),
  case_number: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_cost: z.string().optional(),
  warranty_expiry: z.string().optional(),
  last_maintenance: z.string().optional(),
  next_maintenance: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface Category {
  id: string;
  code: string;
  name: string;
}

interface Subcategory {
  id: string;
  code: string;
  name: string;
  category_id: string;
}

interface Model {
  id: string;
  code: string;
  name: string;
  brand: string;
  display: string;
  subcategory_id: string;
}

interface Location {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface AddAssetFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  models: Model[];
  locations: Location[];
  suppliers: Supplier[];
  assetSequences: Record<string, number>;
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

export function AddAssetForm({ categories, subcategories, models, locations, suppliers, assetSequences }: AddAssetFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      status: "AVAILABLE",
      condition: "GOOD",
    },
  });

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  const locationOptions = locations.map((l) => ({
    value: l.id,
    label: l.name,
  }));

  const supplierOptions = [
    { value: "", label: "Select Supplier (Optional)" },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ];

  const selectedModel = watch("model_id");
  const selectedStatus = watch("status");
  const selectedCondition = watch("condition");
  const selectedSupplier = watch("supplier_id");

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategories.filter((s) => s.category_id === selectedCategory);
  }, [selectedCategory, subcategories]);

  const filteredModels = useMemo(() => {
    if (!selectedSubcategory) return [];
    return models.filter((m) => m.subcategory_id === selectedSubcategory);
  }, [selectedSubcategory, models]);

  const subcategoryOptions = filteredSubcategories.map((s) => ({
    value: s.id,
    label: `${s.code} - ${s.name}`,
  }));

  const modelOptions = filteredModels.map((m) => ({
    value: m.id,
    label: `${m.code} - ${m.brand} ${m.name}`,
  }));

  const selectedCategoryData = useMemo(() => 
    categories.find((c) => c.id === selectedCategory), 
  [selectedCategory, categories]);

  const selectedSubcategoryData = useMemo(() => 
    subcategories.find((s) => s.id === selectedSubcategory),
  [selectedSubcategory, subcategories]);

  const selectedModelData = useMemo(() => 
    models.find((m) => m.id === selectedModel),
  [selectedModel, models]);

  useMemo(() => {
    if (selectedCategoryData && selectedSubcategoryData && selectedModelData) {
      const key = `${selectedCategoryData.id}|${selectedSubcategoryData.id}|${selectedModelData.id}`;
      const lastSeq = assetSequences[key] || 0;
      const nextSeq = lastSeq + 1;
      const code = `${selectedCategoryData.code}-${selectedSubcategoryData.code}-${selectedModelData.code}-${String(nextSeq).padStart(4, "0")}`;
      setGeneratedCode(code);
    } else {
      setGeneratedCode("");
    }
  }, [selectedCategoryData, selectedSubcategoryData, selectedModelData, assetSequences]);

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setSelectedSubcategory("");
    setValue("model_id", "");
  };

  const handleSubcategoryChange = (val: string) => {
    setSelectedSubcategory(val);
    setValue("model_id", "");
  };

  const canSubmit = selectedCategory && selectedSubcategory && selectedModel && watch("location_id");

  const onSubmit = async (data: AssetFormData) => {
    if (!generatedCode) {
      setError("Please select category, subcategory, and model first");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("assets").insert({
      asset_code: generatedCode,
      model_id: data.model_id,
      supplier_id: data.supplier_id || null,
      serial_number: data.serial_number || null,
      description: data.description || null,
      weight: data.weight || null,
      invoice_number: data.invoice_number || null,
      status: data.status,
      condition: data.condition,
      location_id: data.location_id,
      case_number: data.case_number || null,
      purchase_date: data.purchase_date ? new Date(data.purchase_date) : null,
      purchase_cost: data.purchase_cost ? parseFloat(data.purchase_cost) : null,
      warranty_expiry: data.warranty_expiry ? new Date(data.warranty_expiry) : null,
      last_maintenance: data.last_maintenance ? new Date(data.last_maintenance) : null,
      next_maintenance: data.next_maintenance ? new Date(data.next_maintenance) : null,
      is_active: true,
    });

    setIsLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/inv/assets");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-[#e4e4e7] p-6 space-y-4">
        <h3 className="font-medium text-[#242424]">Select Model</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Select category"
          />

          <Select
            label="Subcategory"
            options={subcategoryOptions}
            value={selectedSubcategory}
            onChange={handleSubcategoryChange}
            placeholder={selectedCategory ? "Select subcategory" : "Select category first"}
            disabled={!selectedCategory}
          />

          <Select
            label="Model"
            options={modelOptions}
            value={selectedModel || ""}
            onChange={(val) => setValue("model_id", val, { shouldValidate: true })}
            placeholder={selectedSubcategory ? "Select model" : "Select subcategory first"}
            disabled={!selectedSubcategory}
            error={errors.model_id?.message}
          />
        </div>

        {generatedCode && (
          <div className="mt-4 p-4 bg-[#f4f4f5] rounded-lg border border-[#e4e4e7]">
            <p className="text-sm text-[#71717a]">Asset Code</p>
            <p className="text-lg font-semibold text-[#242424]">{generatedCode}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[#e4e4e7] p-6 space-y-4">
        <h3 className="font-medium text-[#242424]">Asset Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Serial Number"
            {...register("serial_number")}
            placeholder="Enter serial number"
          />

          <Input
            label="Case Number"
            {...register("case_number")}
            placeholder="Enter case number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Weight"
            {...register("weight")}
            placeholder="e.g., 2.5 kg"
          />

          <Select
            label="Supplier"
            options={supplierOptions}
            value={selectedSupplier || ""}
            onChange={(val) => setValue("supplier_id", val)}
          />
        </div>

        <Input
          label="Invoice Number"
          {...register("invoice_number")}
          placeholder="Enter invoice number"
        />

        <Textarea
          label="Description"
          {...register("description")}
          placeholder="Optional notes about this asset"
          rows={3}
        />
      </div>

      <div className="bg-white rounded-lg border border-[#e4e4e7] p-6 space-y-4">
        <h3 className="font-medium text-[#242424]">Status & Location</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={selectedStatus || "AVAILABLE"}
            onChange={(val) => setValue("status", val as AssetFormData["status"])}
            error={errors.status?.message}
          />

          <Select
            label="Condition"
            options={conditionOptions}
            value={selectedCondition || "GOOD"}
            onChange={(val) => setValue("condition", val as AssetFormData["condition"])}
            error={errors.condition?.message}
          />

          <Select
            label="Location"
            options={locationOptions}
            value={watch("location_id") || ""}
            onChange={(val) => setValue("location_id", val, { shouldValidate: true })}
            error={errors.location_id?.message}
            placeholder="Select location"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e4e4e7] p-6 space-y-4">
        <h3 className="font-medium text-[#242424]">Purchase & Warranty</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            {...register("purchase_date")}
          />

          <Input
            label="Purchase Cost"
            type="number"
            step="0.01"
            {...register("purchase_cost")}
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Warranty Expiry"
            type="date"
            {...register("warranty_expiry")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Last Maintenance"
              type="date"
              {...register("last_maintenance")}
            />
            <Input
              label="Next Maintenance"
              type="date"
              {...register("next_maintenance")}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/inv/assets" className="flex-1">
          <Button type="button" variant="secondary" className="w-full">
            Cancel
          </Button>
        </Link>
        <Button type="submit" loading={isLoading} disabled={!canSubmit} className="flex-1">
          Add Asset
        </Button>
      </div>
    </form>
  );
}