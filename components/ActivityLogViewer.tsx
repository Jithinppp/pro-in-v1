"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock, User, ChevronDown, ChevronUp, Package, Wrench, Image, Trash2, Edit3 } from "lucide-react";

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user?: {
    email: string;
  } | null;
}

interface ActivityLogViewerProps {
  entityId: string;
  entityType?: string;
  limit?: number;
}

const actionLabels: Record<string, { label: string; icon: React.ElementType }> = {
  created: { label: "Created", icon: Package },
  updated: { label: "Updated", icon: Edit3 },
  deleted: { label: "Deleted", icon: Trash2 },
  maintenance_log_added: { label: "Maintenance Log Added", icon: Wrench },
  attachment_added: { label: "Attachment Added", icon: Image },
  attachment_deleted: { label: "Attachment Removed", icon: Image },
};

export function ActivityLogViewer({ entityId, entityType = "asset", limit = 10 }: ActivityLogViewerProps) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadLogs = async () => {
    if (hasLoaded && logs.length > 0) return;
    
    setIsLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from("activity_log")
      .select("*, user:profiles(email)")
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }

    const { data } = await query.limit(limit);
    
    if (data) {
      setLogs(data as unknown as ActivityLogEntry[]);
      setHasLoaded(true);
    }
    setIsLoading(false);
  };

  const handleToggle = async () => {
    if (!isExpanded && !hasLoaded) {
      await loadLogs();
    }
    setIsExpanded(!isExpanded);
  };

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

  const formatAction = (action: string) => {
    const config = actionLabels[action];
    if (config) {
      return config.label;
    }
    return action.replace(/_/g, " ");
  };

  const getActionIcon = (action: string) => {
    const config = actionLabels[action];
    if (config) {
      return config.icon;
    }
    return Package;
  };

  return (
    <div className="bg-white border border-[#e4e4e7] rounded-lg p-4">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#71717a]" />
          <span className="text-sm font-medium text-[#242424]">Activity Log</span>
          {logs.length > 0 && (
            <span className="text-xs text-[#71717a]">({logs.length})</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[#71717a]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#71717a]" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="text-sm text-[#71717a] text-center py-4">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-[#71717a] text-center py-4">No activity yet</div>
          ) : (
            logs.map((log) => {
              const Icon = getActionIcon(log.action);
              return (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="p-1.5 bg-[#f4f4f5] rounded-lg flex-shrink-0">
                    <Icon className="w-3 h-3 text-[#71717a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[#242424]">
                        {formatAction(log.action)}
                      </span>
                      {log.user?.email && (
                        <span className="text-xs text-[#71717a] truncate">
                          by {log.user.email.split("@")[0]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#71717a]">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}