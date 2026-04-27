import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, LocationsList } from "@/components";
import { ArrowLeft } from "lucide-react";

export default async function LocationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: locations } = await supabase
    .from("storage_locations")
    .select(`
      id,
      parent_id,
      name,
      description,
      is_active,
      created_at,
      parent:storage_locations (name)
    `)
    .order("created_at", { ascending: false });

  const formattedLocations = (locations || []).map((loc: any) => ({
    id: loc.id,
    parent_id: loc.parent_id,
    name: loc.name,
    description: loc.description,
    is_active: loc.is_active,
    parent: loc.parent ? { name: loc.parent.name } : undefined,
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/inv"
            className="p-2 hover:bg-[#e4e4e7] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#898989]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#242424]">Storage Locations</h1>
            <p className="text-sm text-[#898989]">Manage physical storage locations</p>
          </div>
        </div>

        <div className="space-y-8">
          <LocationsList locations={formattedLocations} />
        </div>
      </main>
    </div>
  );
}