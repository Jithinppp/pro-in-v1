import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, AddAssetForm } from "@/components";
import { ArrowLeft, Package, Plus } from "lucide-react";

export default async function AddAssetPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, code, name")
    .eq("is_active", true)
    .order("name");

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("id, code, name, category_id")
    .eq("is_active", true)
    .order("name");

  const { data: models } = await supabase
    .from("models")
    .select("id, code, name, brand, subcategory_id")
    .eq("is_active", true)
    .order("brand")
    .order("name");

  const { data: existingAssets } = await supabase
    .from("assets")
    .select(`
      id,
      asset_code,
      model_id,
      model:models (
        subcategory_id,
        subcategory:subcategories (category_id)
      )
    `)
    .not("asset_code", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);

  const { data: locations } = await supabase
    .from("storage_locations")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name")
    .order("name");

  const formattedCategories = (categories || []).map((cat: any) => ({
    id: cat.id,
    code: cat.code,
    name: cat.name,
  }));

  const formattedSubcategories = (subcategories || []).map((sub: any) => ({
    id: sub.id,
    code: sub.code,
    name: sub.name,
    category_id: sub.category_id,
  }));

  const formattedModels = (models || []).map((model: any) => ({
    id: model.id,
    code: model.code,
    name: model.name,
    brand: model.brand,
    subcategory_id: model.subcategory_id,
    display: `${model.brand} - ${model.name}`,
  }));

  const assetSequences: Record<string, number> = {};
  (existingAssets || []).forEach((asset: any) => {
    if (asset.model?.subcategory?.category_id && asset.model.subcategory_id && asset.model_id && asset.asset_code) {
      const key = `${asset.model.subcategory.category_id}|${asset.model.subcategory_id}|${asset.model_id}`;
      const match = asset.asset_code.match(/-(\d+)$/);
      const seq = match ? parseInt(match[1], 10) : 0;
      if (!assetSequences[key] || seq > assetSequences[key]) {
        assetSequences[key] = seq;
      }
    }
  });

  const formattedLocations = (locations || []).map((loc: any) => ({
    id: loc.id,
    name: loc.name,
  }));

  const formattedSuppliers = (suppliers || []).map((sup: any) => ({
    id: sup.id,
    name: sup.name,
  }));

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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f4f4f5] rounded-lg">
              <Plus className="w-5 h-5 text-[#71717a]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#242424]">Add New Asset</h1>
              <p className="text-sm text-[#898989]">Register a new asset in the inventory</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-[#242424] mb-4">
            Add New Asset
          </h2>
          <AddAssetForm 
            categories={formattedCategories}
            subcategories={formattedSubcategories}
            models={formattedModels}
            locations={formattedLocations}
            suppliers={formattedSuppliers}
            assetSequences={assetSequences}
          />
        </div>
      </main>
    </div>
  );
}