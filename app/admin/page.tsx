import { createClient } from "@/lib/supabase/server";
import { Navbar, StatsCard } from "@/components";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [usersResult, assetsResult, projectsResult, activitiesResult] = await Promise.all([
    supabase.from("profiles").select("id, role", { count: "exact" }),
    supabase.from("assets").select("id, status", { count: "exact" }),
    supabase.from("projects").select("id, status", { count: "exact" }),
    supabase.from("activity_log").select("id", { count: "exact" }),
  ]);

  const users = usersResult.data || [];
  const assets = assetsResult.data || [];
  const projects = projectsResult.data || [];

  const assetsByStatus = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const usersByRole = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="p-8">
        <h1 className="text-2xl font-semibold text-[#242424] mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label="Total Users"
            value={users.length}
            subtext={`${usersByRole["ADMIN"] || 0} admins, ${usersByRole["PM"] || 0} PMs`}
          />
          <StatsCard
            label="Total Assets"
            value={assets.length}
            subtext={`${assetsByStatus["AVAILABLE"] || 0} available`}
          />
          <StatsCard
            label="Active Projects"
            value={projects.filter((p) => p.status === "ACTIVE").length}
            subtext={`${projects.filter((p) => p.status === "PLANNING").length} planning`}
          />
          <StatsCard
            label="Activity Log"
            value={activitiesResult.count || 0}
            subtext="Recent system events"
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
            <h2 className="text-lg font-semibold text-[#242424] mb-4">Users by Role</h2>
            <div className="space-y-3">
              {Object.entries(usersByRole).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-sm text-[#898989]">{role}</span>
                  <span className="text-sm font-medium text-[#242424]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}