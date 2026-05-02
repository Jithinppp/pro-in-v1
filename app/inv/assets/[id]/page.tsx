import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, AssetDetailClient, type Asset } from "@/components";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: asset } = await supabase
    .from("assets")
    .select(
      `
      id,
      asset_code,
      serial_number,
      description,
      weight,
      invoice_number,
      status,
      condition,
      case_number,
      purchase_date,
      purchase_cost,
      warranty_expiry,
      last_maintenance,
      next_maintenance,
      is_active,
      created_at,
      updated_at,
      location_id,
      location:storage_locations(name),
      model:models(
        id,
        name,
        brand,
        code,
        specs,
        subcategory:subcategories(
          id,
          name,
          code,
          category:categories(id, name, code)
        )
      ),
      supplier:suppliers(name)
    `,
    )
    .eq("id", id)
    .single();

  if (!asset || !asset.is_active) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar email={user?.email || ""} />
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/inv/assets"
              className="p-2 hover:bg-[#e4e4e7] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#898989]" />
            </Link>
            <h1 className="text-2xl font-semibold text-[#242424]">
              Asset Not Found
            </h1>
          </div>
          <p className="text-[#898989]">
            The requested asset has been deleted or is no longer active.
          </p>
        </main>
      </div>
    );
  }

  const formattedAsset = {
    id: asset.id,
    asset_code: asset.asset_code,
    serial_number: asset.serial_number,
    description: asset.description,
    weight: asset.weight,
    invoice_number: asset.invoice_number,
    status: asset.status,
    condition: asset.condition,
    case_number: asset.case_number,
    purchase_date: asset.purchase_date,
    purchase_cost: asset.purchase_cost,
    warranty_expiry: asset.warranty_expiry,
    last_maintenance: asset.last_maintenance,
    next_maintenance: asset.next_maintenance,
    is_active: asset.is_active,
    created_at: asset.created_at,
    updated_at: asset.updated_at,
    location_id: asset.location_id,
    location: Array.isArray(asset.location) && asset.location[0] 
      ? { name: asset.location[0].name } 
      : undefined,
    model: Array.isArray(asset.model) && asset.model[0]
      ? asset.model[0]
      : undefined,
    supplier: Array.isArray(asset.supplier) && asset.supplier[0]
      ? { name: asset.supplier[0].name }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <AssetDetailClient asset={formattedAsset as Asset} />
    </div>
  );
}
