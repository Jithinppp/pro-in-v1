"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Navbar, Input, Button, Textarea } from "@/components";
import { createKit, addKitAsset, addKitConsumable } from "@/lib/actions/kits";
import { Package, X, Plus, Trash2, ArrowLeft } from "lucide-react";

interface Asset {
  id: string;
  asset_code: string;
  model?: { name: string; brand: string };
}

interface Model {
  id: string;
  name: string;
  brand: string;
}

export default function AddKitPage() {
  const router = useRouter();
  const supabase = createClient();

  const [assetResults, setAssetResults] = useState<Asset[]>([]);
  const [modelResults, setModelResults] = useState<Model[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [kitName, setKitName] = useState("");
  const [kitDescription, setKitDescription] = useState("");
  const [consumableQty, setConsumableQty] = useState("1");
  const [assetSearch, setAssetSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [kitItems, setKitItems] = useState<{
    type: "ASSET" | "CONSUMABLE";
    id: string;
    name: string;
    quantity: number;
  }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const searchAssets = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setAssetResults([]);
      return;
    }
    setLoadingAssets(true);
    const { data } = await supabase
      .from("assets")
      .select("id, asset_code, model:models(name, brand)")
      .eq("is_active", true)
      .eq("status", "AVAILABLE")
      .ilike("asset_code", `%${query}%`)
      .order("asset_code")
      .limit(20);
    
    const { data: kitItems } = await supabase
      .from("kit_items")
      .select("asset_id")
      .eq("item_type", "ASSET");
    
    const usedAssetIds = new Set((kitItems || []).map((i) => i.asset_id).filter(Boolean));
    const filtered = (data || []).filter((a) => !usedAssetIds.has(a.id));
    
    setAssetResults((filtered || []) as any);
    setLoadingAssets(false);
  }, [supabase]);

  const searchModels = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setModelResults([]);
      return;
    }
    setLoadingModels(true);
    const { data } = await supabase
      .from("models")
      .select("id, name, brand")
      .eq("is_active", true)
      .ilike("name", `%${query}%`)
      .order("brand")
      .order("name")
      .limit(10);
    setModelResults((data || []) as any);
    setLoadingModels(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => searchAssets(assetSearch), 300);
    return () => clearTimeout(timer);
  }, [assetSearch, searchAssets]);

  useEffect(() => {
    const timer = setTimeout(() => searchModels(modelSearch), 300);
    return () => clearTimeout(timer);
  }, [modelSearch, searchModels]);

  const handleRemoveItem = (index: number) => {
    setKitItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitName) {
      setError("Kit name is required");
      return;
    }
    if (kitItems.length === 0) {
      setError("Add at least one item to the kit");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const result = await createKit(kitName, kitDescription);
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    const kitId = result.kit?.id;
    for (const item of kitItems) {
      if (item.type === "ASSET") {
        await addKitAsset(kitId, item.id, item.quantity);
      } else {
        await addKitConsumable(kitId, item.id, item.quantity);
      }
    }
    router.push("/inv/kits");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email="" />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/inv/kits" className="p-2 hover:bg-[#e4e4e7] rounded-lg">
            <ArrowLeft className="w-5 h-5 text-[#898989]" />
          </Link>
          <h1 className="text-2xl font-semibold text-[#242424]">Create New Kit</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#242424]">Kit Details</h2>
            <Input
              label="Kit Name"
              value={kitName}
              onChange={(e) => setKitName(e.target.value)}
              placeholder="e.g., Camera Kit A, Lighting Kit"
              required
            />
            <Textarea
              label="Description (optional)"
              value={kitDescription}
              onChange={(e) => setKitDescription(e.target.value)}
              placeholder="Describe what's in this kit..."
            />
          </div>
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#242424]">Add Assets</h2>
            <p className="text-sm text-[#71717a]">Search by asset code (min 2 chars)</p>
            <Input
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              placeholder="Search assets (e.g., SONY-FX6)..."
            />
            {assetSearch.length >= 2 && (
              <div className="bg-[#f4f4f5] rounded-lg p-2 max-h-40 overflow-y-auto">
                {loadingAssets ? (
                  <p className="text-sm text-[#71717a] px-3 py-2">Searching...</p>
                ) : assetResults.length === 0 ? (
                  <p className="text-sm text-[#71717a] px-3 py-2">No available assets found</p>
                ) : (
                  assetResults.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setKitItems((prev) => [
                          ...prev,
                          { type: "ASSET", id: asset.id, name: `${asset.model?.brand} ${asset.model?.name} (${asset.asset_code})`, quantity: 1 },
                        ]);
                        setAssetSearch("");
                        setAssetResults([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#e4e4e7] rounded"
                    >
                      <span className="font-medium">{asset.asset_code}</span>
                      <span className="text-[#71717a] ml-2">{asset.model?.brand} {asset.model?.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#242424]">Add Consumables</h2>
            <p className="text-sm text-[#71717a]">Search by model name (min 2 chars)</p>
            <Input
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Search models (e.g., tape)..."
            />
            {modelSearch.length >= 2 && !selectedModel && (
              <div className="bg-[#f4f4f5] rounded-lg p-2 max-h-40 overflow-y-auto">
                {loadingModels ? (
                  <p className="text-sm text-[#71717a] px-3 py-2">Searching...</p>
                ) : modelResults.length === 0 ? (
                  <p className="text-sm text-[#71717a] px-3 py-2">No models found</p>
                ) : (
                  modelResults.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setSelectedModel(model)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#e4e4e7] rounded"
                    >
                      <span className="font-medium">{model.brand}</span>
                      <span className="text-[#71717a] ml-2">{model.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
            {selectedModel && (
              <div className="bg-[#f4f4f5] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#242424]">{selectedModel.brand}</p>
                    <p className="text-sm text-[#71717a]">{selectedModel.name}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedModel(null)} className="p-1 text-[#71717a] hover:text-[#242424]">×</button>
                </div>
                <div className="flex gap-2 items-end mt-3">
                  <div className="w-24">
                    <Input
                      type="number"
                      label="Qty"
                      value={consumableQty}
                      onChange={(e) => setConsumableQty(e.target.value)}
                      min="1"
                      placeholder="1"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setKitItems((prev) => [
                        ...prev,
                        { type: "CONSUMABLE", id: selectedModel.id, name: `${selectedModel.brand} - ${selectedModel.name}`, quantity: parseInt(consumableQty) || 1 },
                      ]);
                      setSelectedModel(null);
                      setModelSearch("");
                      setConsumableQty("1");
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#242424] mb-4">Kit Items ({kitItems.length})</h2>
            {kitItems.length === 0 ? (
              <p className="text-sm text-[#71717a] text-center py-4">No items added yet</p>
            ) : (
              <div className="space-y-2">
                {kitItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#f4f4f5] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 text-xs font-medium rounded ${item.type === "ASSET" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                        {item.type}
                      </div>
                      <span className="text-sm text-[#242424]">{item.name}</span>
                      {item.type === "CONSUMABLE" && <span className="text-xs text-[#71717a]">×{item.quantity}</span>}
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/inv/kits")} className="flex-1">Cancel</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">Create Kit</Button>
          </div>
        </form>
      </main>
    </div>
  );
}