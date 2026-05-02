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