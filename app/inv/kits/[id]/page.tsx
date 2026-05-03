import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components";
import { ArrowLeft, Package, Box, Edit, Trash2, Camera, Zap } from "lucide-react";
import { KitDetailClient } from "./KitDetailClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function KitDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: kit } = await supabase
    .from("kits")
    .select("*")
    .eq("id", id)
    .single();

  if (!kit) {
    redirect("/inv/kits");
  }

  const { data: kitItems } = await supabase
    .from("kit_items")
    .select("*, asset:assets(asset_code, model:models(name, brand), location:storage_locations(name))")
    .eq("kit_id", id);

  const assets = (kitItems || []).filter((i: any) => i.item_type === "ASSET");
  const consumables = (kitItems || []).filter((i: any) => i.item_type === "CONSUMABLE");

  return (
    <KitDetailClient 
      kit={kit} 
      assets={assets} 
      consumables={consumables}
      userEmail={user.email || ""}
    />
  );
}