"use server";

import { createClient } from "@/lib/supabase/server";

export async function getKits() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kits")
    .select("*, kit_items(*, asset:assets(asset_code, model:models(name, brand), location:storage_locations(name))")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { kits: data };
}

export async function getKitById(kitId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kits")
    .select("*, kit_items(*, asset:assets(asset_code, model:models(name, brand), location:storage_locations(name))")
    .eq("id", kitId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { kit: data };
}

export async function createKit(name: string, description?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kits")
    .insert({
      name,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { kit: data };
}

export async function addKitAsset(kitId: string, assetId: string, quantity: number = 1) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kit_items")
    .insert({
      kit_id: kitId,
      item_type: "ASSET",
      asset_id: assetId,
      model_id: null,
      quantity,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { item: data };
}

export async function addKitConsumable(kitId: string, modelId: string, quantity: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kit_items")
    .insert({
      kit_id: kitId,
      item_type: "CONSUMABLE",
      asset_id: null,
      model_id: modelId,
      quantity,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { item: data };
}

export async function removeKitItem(itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("kit_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateKit(kitId: string, name: string, description?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kits")
    .update({
      name,
      description: description || null,
    })
    .eq("id", kitId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { kit: data };
}

export async function deleteKit(kitId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("kits")
    .delete()
    .eq("id", kitId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}