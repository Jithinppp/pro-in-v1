import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components";
import { ArrowLeft, Clock, Package, Settings, MapPin, Plus, Edit3, Trash2, Image, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: activity, count } = await supabase
    .from("activity_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "asset":
        return Package;
      case "location":
        return MapPin;
      case "attachment":
        return Image;
      default:
        return Settings;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return Plus;
      case "updated":
        return Edit3;
      case "deleted":
        return Trash2;
      case "maintenance_log_added":
        return Wrench;
      case "attachment_added":
        return Image;
      default:
        return Settings;
    }
  };

  const formatAction = (action: string) => {
    switch (action) {
      case "created":
        return "Created";
      case "updated":
        return "Updated";
      case "deleted":
        return "Deleted";
      case "maintenance_log_added":
        return "Maintenance Added";
      case "attachment_added":
        return "Attachment Added";
      default:
        return action.replace(/_/g, " ");
    }
  };

  const getChangesSummary = (oldValue: any, newValue: any, action: string) => {
    if (action === "created") {
      return "New record created";
    }
    if (action === "deleted") {
      return "Record deleted";
    }
    if (action === "updated" && oldValue && newValue) {
      try {
        const old = typeof oldValue === 'string' ? JSON.parse(oldValue) : oldValue;
        const neu = typeof newValue === 'string' ? JSON.parse(newValue) : newValue;
        const changes: string[] = [];
        
        // Check key fields that changed
        if (old.status !== neu.status) changes.push(`status: ${old.status} → ${neu.status}`);
        if (old.condition !== neu.condition) changes.push(`condition: ${old.condition} → ${neu.condition}`);
        if (old.is_active !== neu.is_active) changes.push(`active: ${old.is_active} → ${neu.is_active}`);
        
        return changes.length > 0 ? changes.join(", ") : "Details changed";
      } catch {
        return "Updated";
      }
    }
    return "";
  };

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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f4f4f5] rounded-lg">
              <Clock className="w-5 h-5 text-[#71717a]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#242424]">Activity Log</h1>
              <p className="text-sm text-[#898989]">{count || 0} total activities</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-[#fafafa] border-b border-[#e4e4e7]">
              <tr>
                <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Action</th>
                <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Details</th>
                <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {activity && activity.length > 0 ? activity.map((log: any) => {
                const Icon = getEntityIcon(log.entity_type);
                const ActionIcon = getActionIcon(log.action);
                const changes = getChangesSummary(log.old_value, log.new_value, log.action);
                
                return (
                  <tr key={log.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#f4f4f5] rounded">
                          <Icon className="w-3 h-3 text-[#71717a]" />
                        </div>
                        <span className="text-sm font-medium text-[#242424] capitalize">
                          {log.entity_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ActionIcon className={`w-3 h-3 ${
                          log.action === 'created' ? 'text-green-600' :
                          log.action === 'deleted' ? 'text-red-600' :
                          'text-blue-600'
                        }`} />
                        <span className="text-sm text-[#242424]">
                          {formatAction(log.action)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#71717a]">
                      {changes || (log.new_value ? "View details" : "-")}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#71717a]">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[#71717a]">
                    No activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}