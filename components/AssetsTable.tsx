"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Asset {
  id: string;
  asset_code: string;
  serial_number: string | null;
  description: string | null;
  status: string;
  condition: string;
  case_number: string | null;
  location_id: string | null;
  model_id: string | null;
  is_active: boolean;
  location?: {
    name: string;
  };
  model?: {
    name: string;
    brand: string;
    subcategory?: {
      name: string;
    };
  };
}

interface AssetsTableProps {
  assets: Asset[];
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  RESERVED: "bg-blue-100 text-blue-700",
  OUT: "bg-orange-100 text-orange-700",
  PENDING_QC: "bg-yellow-100 text-yellow-700",
  MAINTENANCE: "bg-red-100 text-red-700",
  QUARANTINED: "bg-purple-100 text-purple-700",
};

const conditionColors: Record<string, string> = {
  EXCELLENT: "bg-green-100 text-green-700",
  GOOD: "bg-blue-100 text-blue-700",
  FAIR: "bg-yellow-100 text-yellow-700",
  POOR: "bg-red-100 text-red-700",
};

export function AssetsTable({ assets }: AssetsTableProps) {

  if (assets.length === 0) {
    return (
      <div className="bg-white border border-[#e4e4e7] rounded-lg p-8 text-center">
        <p className="text-[#898989]">No assets found</p>
        <p className="text-sm text-[#a1a1aa]">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e4e4e7]">
            <tr>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Asset Code
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Model
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Serial #
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Location
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Condition
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-16">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e4e7]">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-[#fafafa]">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#242424]">
                    {asset.asset_code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-sm text-[#242424]">
                      {asset.model?.brand} {asset.model?.name}
                    </span>
                    {asset.model?.subcategory && (
                      <p className="text-xs text-[#71717a]">{asset.model.subcategory.name}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#898989]">
                    {asset.serial_number || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#898989]">
                    {asset.location?.name || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[asset.status] || "bg-gray-100 text-gray-700"}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${conditionColors[asset.condition] || "bg-gray-100 text-gray-700"}`}>
                    {asset.condition}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/inv/assets/${asset.id}`}
                    className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors text-[#898989] hover:text-[#242424] inline-flex"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}