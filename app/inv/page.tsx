import { createClient } from "@/lib/supabase/server";
import { Navbar, StatsCard } from "@/components";

export default async function InvDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [assetsResult, consumablesResult, categoriesResult, locationsResult, modelsResult] = await Promise.all([
    supabase.from("assets").select("id, status, condition", { count: "exact" }),
    supabase.from("consumables").select("id, quantity, low_stock_threshold"),
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("storage_locations").select("id", { count: "exact" }),
    supabase.from("models").select("id", { count: "exact" }),
  ]);

  const assets = assetsResult.data || [];
  const consumables = consumablesResult.data || [];

  const assetsByStatus = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lowStockConsumables = consumables.filter(
    (c) => c.quantity <= c.low_stock_threshold
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="p-8">
        <h1 className="text-2xl font-semibold text-[#242424] mb-8">Inventory Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label="Total Assets"
            value={assets.length}
            subtext={`${assetsByStatus["AVAILABLE"] || 0} available`}
          />
          <StatsCard
            label="Categories"
            value={categoriesResult.count || 0}
            subtext="In catalog"
          />
          <StatsCard
            label="Models"
            value={modelsResult.count || 0}
            subtext="Products"
          />
          <StatsCard
            label="Storage Locations"
            value={locationsResult.count || 0}
            subtext="Active locations"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#242424] mb-4">Assets by Status</h2>
            <div className="space-y-3">
              {Object.entries(assetsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-[#898989]">{status}</span>
                  <span className="text-sm font-medium text-[#242424]">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#242424] mb-4">
              Low Stock Alert
              {lowStockConsumables.length > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                  {lowStockConsumables.length}
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {lowStockConsumables.length === 0 ? (
                <p className="text-sm text-[#898989]">All items in stock</p>
              ) : (
                lowStockConsumables.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-[#FAFAFA] rounded">
                    <span className="text-sm text-[#242424]">Consumable #{item.id.slice(0, 8)}</span>
                    <span className="text-xs text-red-500">
                      {item.quantity} / {item.low_stock_threshold}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}