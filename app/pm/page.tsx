import { createClient } from "@/lib/supabase/server";
import { Navbar, StatsCard } from "@/components";

export default async function PMDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [projectsResult, venuesResult, assetsResult] = await Promise.all([
    supabase.from("projects").select("id, status, start_date, end_date, name", { count: "exact" }),
    supabase.from("venues").select("id", { count: "exact" }),
    supabase.from("assets").select("id, status", { count: "exact" }),
  ]);

  const projects = projectsResult.data || [];
  const assets = assetsResult.data || [];

  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const upcomingProjects = projects.filter((p) => p.status === "PLANNING");

  const outAssets = assets.filter((a) => a.status === "OUT").length;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="p-8">
        <h1 className="text-2xl font-semibold text-[#242424] mb-8">Project Manager Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label="Total Projects"
            value={projects.length}
            subtext="All time"
          />
          <StatsCard
            label="Active Projects"
            value={activeProjects.length}
            subtext="Currently running"
          />
          <StatsCard
            label="Upcoming"
            value={upcomingProjects.length}
            subtext="In planning"
          />
          <StatsCard
            label="Assets Deployed"
            value={outAssets}
            subtext="Currently out"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#242424] mb-4">Active Projects</h2>
            <div className="space-y-3">
              {activeProjects.length === 0 ? (
                <p className="text-sm text-[#898989]">No active projects</p>
              ) : (
                activeProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex justify-between items-center p-2 bg-[#FAFAFA] rounded">
                    <span className="text-sm text-[#242424]">{project.name}</span>
                    <span className="text-xs text-[#898989]">
                      {project.start_date} - {project.end_date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#242424] mb-4">Upcoming Projects</h2>
            <div className="space-y-3">
              {upcomingProjects.length === 0 ? (
                <p className="text-sm text-[#898989]">No upcoming projects</p>
              ) : (
                upcomingProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex justify-between items-center p-2 bg-[#FAFAFA] rounded">
                    <span className="text-sm text-[#242424]">{project.name}</span>
                    <span className="text-xs text-[#898989]">{project.start_date}</span>
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