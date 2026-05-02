"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EditAssetModal, SoftDeleteModal } from "@/components";
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, ClipboardList, Pencil, Trash2 } from "lucide-react";

export interface Asset {
  id: string;
  asset_code: string;
  serial_number: string | null;
  description: string | null;
  weight: string | null;
  invoice_number: string | null;
  status: string;
  condition: string;
  case_number: string | null;
  purchase_date: string | null;
  purchase_cost: number | null;
  warranty_expiry: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  location?: { name: string };
  model?: {
    name: string;
    brand: string;
    code: string;
    specs: Record<string, string> | null;
    subcategory?: {
      name: string;
      code: string;
      category?: { name: string };
    };
  };
  supplier?: { name: string };
  location_id: string | null;
}

interface AssetDetailClientProps {
  asset: Asset;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700 border-green-200",
  RESERVED: "bg-blue-100 text-blue-700 border-blue-200",
  OUT: "bg-orange-100 text-orange-700 border-orange-200",
  PENDING_QC: "bg-yellow-100 text-yellow-700 border-yellow-200",
  MAINTENANCE: "bg-red-100 text-red-700 border-red-200",
  QUARANTINED: "bg-purple-100 text-purple-700 border-purple-200",
};

const conditionColors: Record<string, string> = {
  EXCELLENT: "bg-green-100 text-green-700 border-green-200",
  GOOD: "bg-blue-100 text-blue-700 border-blue-200",
  FAIR: "bg-yellow-100 text-yellow-700 border-yellow-200",
  POOR: "bg-red-100 text-red-700 border-red-200",
};

export function AssetDetailClient({ asset }: AssetDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/inv/assets"
              className="p-2 hover:bg-[#e4e4e7] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#898989]" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f4f4f5] rounded-lg">
                <Package className="w-5 h-5 text-[#71717a]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#242424]">{asset.asset_code}</h1>
                <p className="text-sm text-[#898989]">Asset Details</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status & Condition */}
            <div className="flex flex-wrap items-center gap-4">
              <div className={`px-4 py-2 rounded-lg border ${statusColors[asset.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                <span className="text-sm font-medium">{asset.status}</span>
              </div>
              <div className={`px-4 py-2 rounded-lg border ${conditionColors[asset.condition] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                <span className="text-sm font-medium">{asset.condition}</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors text-[#898989] hover:text-[#242424]"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsDeleting(true)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#898989] hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Model Info */}
            <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
              <h2 className="text-sm font-semibold text-[#242424] mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Model Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Brand</p>
                  <p className="text-sm text-[#242424]">{asset.model?.brand || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Model</p>
                  <p className="text-sm text-[#242424]">{asset.model?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Model Code</p>
                  <p className="text-sm text-[#242424]">{asset.model?.code || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Subcategory</p>
                  <p className="text-sm text-[#242424]">{asset.model?.subcategory?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Category</p>
                  <p className="text-sm text-[#242424]">{asset.model?.subcategory?.category?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Supplier</p>
                  <p className="text-sm text-[#242424]">{asset.supplier?.name || "-"}</p>
                </div>
              </div>

              {asset.model?.specs && Object.keys(asset.model.specs).length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#e4e4e7]">
                  <p className="text-xs text-[#71717a] uppercase tracking-wider mb-2">Specifications</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(asset.model.specs).map(([key, value]) => (
                      <div key={key} className="bg-[#f4f4f5] rounded px-3 py-2">
                        <p className="text-xs text-[#71717a]">{key}</p>
                        <p className="text-sm text-[#242424]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Asset Details */}
            <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
              <h2 className="text-sm font-semibold text-[#242424] mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Asset Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Serial Number</p>
                  <p className="text-sm text-[#242424]">{asset.serial_number || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Case Number</p>
                  <p className="text-sm text-[#242424]">{asset.case_number || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Weight</p>
                  <p className="text-sm text-[#242424]">{asset.weight || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Invoice Number</p>
                  <p className="text-sm text-[#242424]">{asset.invoice_number || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Description</p>
                  <p className="text-sm text-[#242424]">{asset.description || "-"}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
              <h2 className="text-sm font-semibold text-[#242424] mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h2>
              <p className="text-sm text-[#242424]">{asset.location?.name || "Not assigned"}</p>
            </div>

            {/* Purchase & Warranty */}
            <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
              <h2 className="text-sm font-semibold text-[#242424] mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Purchase & Warranty
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Purchase Date</p>
                  <p className="text-sm text-[#242424]">{formatDate(asset.purchase_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Purchase Cost</p>
                  <p className="text-sm text-[#242424]">{formatCurrency(asset.purchase_cost)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Warranty Expiry</p>
                  <p className="text-sm text-[#242424]">{formatDate(asset.warranty_expiry)}</p>
                </div>
              </div>
            </div>

            {/* Maintenance */}
            <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
              <h2 className="text-sm font-semibold text-[#242424] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Maintenance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Last Maintenance</p>
                  <p className="text-sm text-[#242424]">{formatDate(asset.last_maintenance)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wider">Next Maintenance</p>
                  <p className="text-sm text-[#242424]">{formatDate(asset.next_maintenance)}</p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-[#71717a] space-y-1">
              <p>Created: {formatDate(asset.created_at)}</p>
              <p>Last Updated: {formatDate(asset.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <EditAssetModal
          asset={{
            id: asset.id,
            asset_code: asset.asset_code,
            serial_number: asset.serial_number,
            description: asset.description,
            status: asset.status,
            condition: asset.condition,
            case_number: asset.case_number,
            location_id: asset.location_id,
          }}
          onClose={() => setIsEditing(false)}
          onSave={() => {
            setIsEditing(false);
            router.refresh();
          }}
        />
      )}

      {isDeleting && (
        <SoftDeleteModal
          assetId={asset.id}
          assetCode={asset.asset_code}
          onClose={() => setIsDeleting(false)}
        />
      )}
    </>
  );
}