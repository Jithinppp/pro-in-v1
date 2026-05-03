import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components";
import { ArrowLeft, Package, Plus, Box } from "lucide-react";
import { KitsClient } from "./KitsClient";

export const dynamic = "force-dynamic";

export default async function KitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: kits } = await supabase
    .from("kits")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  let kitsWithItems: any[] = [];
  
  if (kits && kits.length > 0) {
    const kitIds = kits.map((k) => k.id);
    
    const { data: kitItems } = await supabase
      .from("kit_items")
      .select("*")
      .in("kit_id", kitIds);

    const itemsByKit: Record<string, any[]> = {};
    (kitItems || []).forEach((item: any) => {
      if (!itemsByKit[item.kit_id]) {
        itemsByKit[item.kit_id] = [];
      }
      itemsByKit[item.kit_id].push(item);
    });

    kitsWithItems = kits.map((kit) => ({
      ...kit,
      kit_items: itemsByKit[kit.id] || [],
    }));
  }

  return (
    <KitsClient kits={kitsWithItems} userEmail={user?.email || ""} />
  );
}