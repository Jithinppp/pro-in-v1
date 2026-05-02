import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function softDeleteAsset(assetId: string, assetCode: string, confirmCode: string) {
  const supabase = await createClient();
  
  if (confirmCode !== assetCode) {
    return { error: "Asset code mismatch. Please type the exact asset code to confirm deletion." };
  }

  const { error } = await supabase
    .from("assets")
    .update({ is_active: false })
    .eq("id", assetId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function addMaintenanceLog(
  assetId: string,
  serviceDate: string,
  description: string,
  technician: string,
  cost: number | null,
  partsReplaced: string,
  nextMaintenanceDays: number | null
) {
  const supabase = await createClient();

  const { error: logError } = await supabase
    .from("maintenance_logs")
    .insert({
      asset_id: assetId,
      service_date: serviceDate,
      description,
      technician: technician || null,
      cost: cost || null,
      parts_replaced: partsReplaced || null,
    });

  if (logError) {
    return { error: logError.message };
  }

  if (nextMaintenanceDays) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextMaintenanceDays);
    const nextMaintenance = nextDate.toISOString().split("T")[0];

    const { error: updateError } = await supabase
      .from("assets")
      .update({
        last_maintenance: serviceDate,
        next_maintenance: nextMaintenance,
      })
      .eq("id", assetId);

    if (updateError) {
      return { error: updateError.message };
    }
  } else {
    const { error: updateError } = await supabase
      .from("assets")
      .update({ last_maintenance: serviceDate })
      .eq("id", assetId);

    if (updateError) {
      return { error: updateError.message };
    }
  }

  return { success: true };
}