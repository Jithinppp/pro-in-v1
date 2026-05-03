"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar, Button } from "@/components";
import { ArrowLeft, Package, Plus, Box } from "lucide-react";

interface KitItem {
  id: string;
  item_type: string;
  asset_id: string | null;
  model_id: string | null;
  quantity: number;
  asset?: {
    asset_code: string;
    model?: { name: string; brand: string };
    location?: { name: string };
  } | null;
}

interface Kit {
  id: string;
  name: string;
  description: string | null;
  kit_items: KitItem[];
}

interface KitsClientProps {
  kits: Kit[];
  userEmail: string;
}

export function KitsClient({ kits, userEmail }: KitsClientProps) {
  const getAssetCount = (kit: Kit) => {
    return kit.kit_items?.filter((i) => i.item_type === "ASSET").length || 0;
  };

  const getConsumableCount = (kit: Kit) => {
    return kit.kit_items?.filter((i) => i.item_type === "CONSUMABLE").length || 0;
  };

  const getTotalItems = (kit: Kit) => {
    const assets = getAssetCount(kit);
    const consumables = getConsumableCount(kit);
    return assets + consumables;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={userEmail} />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/inv" className="p-2 hover:bg-[#e4e4e7] rounded-lg">
              <ArrowLeft className="w-5 h-5 text-[#898989]" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f4f4f5] rounded-lg">
                <Box className="w-5 h-5 text-[#71717a]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#242424]">Kits</h1>
                <p className="text-sm text-[#898989]">Bundled equipment packages</p>
              </div>
            </div>
          </div>
          <Link href="/inv/kits/add" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Kit
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kits.map((kit) => (
            <Link
              key={kit.id}
              href={`/inv/kits/${kit.id}`}
              className="bg-white border border-[#e4e4e7] rounded-lg p-4 hover:border-[#242424]/10 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#f4f4f5] rounded-lg">
                  <Package className="w-5 h-5 text-[#71717a]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[#242424]">{kit.name}</h3>
                  {kit.description && (
                    <p className="text-sm text-[#71717a] mt-1 line-clamp-2">{kit.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-[#71717a]">
                    <span>{getTotalItems(kit)} items</span>
                    <span>{getAssetCount(kit)} assets</span>
                    <span>{getConsumableCount(kit)} consumables</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {kits.length === 0 && (
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-[#d4d4d8] mx-auto mb-4" />
            <p className="text-[#71717a] mb-4">No kits created yet</p>
            <Link href="/inv/kits/add">
              <Button>Create Your First Kit</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}