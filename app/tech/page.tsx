import { createClient } from "@/lib/supabase/server";
import { Navbar, StatsCard } from "@/components";

export default async function TechDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [assetsResult, maintenanceResult, projectsResult] = await Promise.all([
    supabase.from("assets").select("id, status, condition", { count: "exact" }),
    supabase.from("maintenance_logs").select("id, service_date", { count: "exact" }),
    supabase.from("projects").select("id, status", { count: "exact" }),
  ]);

  const assets = assetsResult.data || [];
  const maintenance = maintenanceResult.data || [];

  const assetsByStatus = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maintenanceNeeded = assets.filter(
    (a) => a.status === "MAINTENANCE" || a.condition === "POOR" || a.condition === "FAIR"
  );

  const activeProjects = projectsResult.data?.filter((p) => p.status === "ACTIVE").length || 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="p-8">
        <h1 className="text-2xl font-semibold text-[#242424] mb-8">Technician Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label="Total Assets"
            value={assets.length}
            subtext="In system"
          />
          <StatsCard
            label="Maintenance Needed"
            value={maintenanceNeeded.length}
            subtext="Requires attention"
          />
          <StatsCard
            label="Maintenance Records"
            value={maintenance.length}
            subtext="Total logs"
          />
          <StatsCard
            label="Active Projects"
            value={activeProjects}
            subtext="Ongoing"
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
            <h2 className="text-lg font-semibold text-[#242424] mb-4">Assets Requiring Maintenance</h2>
            <div className="space-y-3">
              {maintenanceNeeded.length === 0 ? (
                <p className="text-sm text-[#898989]">All assets in good condition</p>
              ) : (
                maintenanceNeeded.slice(0, 5).map((asset) => (
                  <div key={asset.id} className="flex justify-between items-center p-2 bg-[#FAFAFA] rounded">
                    <span className="text-sm text-[#242424]">Asset #{asset.id.slice(0, 8)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      asset.status === "MAINTENANCE" ? "bg-yellow-100 text-yellow-700" :
                      asset.condition === "POOR" ? "bg-red-100 text-red-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {asset.status === "MAINTENANCE" ? "Maintenance" : asset.condition}
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