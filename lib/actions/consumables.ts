"use server";

import { createClient } from "@/lib/supabase/server";

export async function adjustConsumableQuantity(
  consumableId: string,
  adjustment: number
) {
  const supabase = await createClient();
  
  const { data: current } = await supabase
    .from("consumables")
    .select("quantity")
    .eq("id", consumableId)
    .single();

  if (!current) return { error: "Consumable not found" };

  const newQuantity = Math.max(0, current.quantity + adjustment);

  const { error } = await supabase
    .from("consumables")
    .update({ quantity: newQuantity })
    .eq("id", consumableId);

  if (error) {
    return { error: error.message };
  }

  return { success: true, quantity: newQuantity };
}

export async function updateConsumable(
  consumableId: string,
  data: {
    location_id?: string | null;
    quantity?: number;
    low_stock_threshold?: number;
    unit_type?: string | null;
  }
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.location_id !== undefined) updateData.location_id = data.location_id;
  if (data.quantity !== undefined) updateData.quantity = Math.max(0, data.quantity);
  if (data.low_stock_threshold !== undefined) updateData.low_stock_threshold = data.low_stock_threshold;
  if (data.unit_type !== undefined) updateData.unit_type = data.unit_type;

  const { error } = await supabase
    .from("consumables")
    .update(updateData)
    .eq("id", consumableId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteConsumable(
  consumableId: string,
  confirmName: string,
  itemName: string
) {
  const supabase = await createClient();

  if (confirmName !== itemName) {
    return { error: "Item name does not match" };
  }

  const { error } = await supabase
    .from("consumables")
    .delete()
    .eq("id", consumableId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getConsumables() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("consumables")
    .select("*, model:models(name, brand, code), location:storage_locations(name)")
    .order("updated_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { consumables: data };
}