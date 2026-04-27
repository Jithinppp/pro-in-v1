"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EditLocationModal } from "./EditLocationModal";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, ChevronDown } from "lucide-react";

interface StorageLocation {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  parent?: {
    name: string;
  };
}

interface LocationsTableProps {
  locations: StorageLocation[];
  onDelete?: () => void;
}

interface TreeNode extends StorageLocation {
  children: TreeNode[];
  level: number;
}

export function LocationsTable({ locations, onDelete }: LocationsTableProps) {
  const router = useRouter();
  const supabase = createClient();
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StorageLocation | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const tree = useMemo(() => {
    const locationMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    locations.forEach((loc) => {
      locationMap.set(loc.id, { ...loc, children: [], level: 0 });
    });

    locations.forEach((loc) => {
      const node = locationMap.get(loc.id)!;
      if (loc.parent_id && locationMap.has(loc.parent_id)) {
        const parent = locationMap.get(loc.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [locations]);

  const flattenTree = (nodes: TreeNode[], expanded: Set<string>): TreeNode[] => {
    const result: TreeNode[] = [];
    nodes.forEach((node) => {
      result.push(node);
      if (node.children.length > 0 && expanded.has(node.id)) {
        result.push(...flattenTree(node.children, expanded));
      }
    });
    return result;
  };

  const visibleNodes = useMemo(() => flattenTree(tree, expandedIds), [tree, expandedIds]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteClick = (location: StorageLocation) => {
    setConfirmDelete(location);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    setDeleteError(null);
    setDeletingId(confirmDelete.id);

    const { data: children } = await supabase
      .from("storage_locations")
      .select("id")
      .eq("parent_id", confirmDelete.id)
      .limit(1);

    if (children && children.length > 0) {
      setDeleteError(`Cannot delete "${confirmDelete.name}" - it has child locations. Remove children first.`);
      setDeletingId(null);
      setConfirmDelete(null);
      return;
    }

    const { error } = await supabase
      .from("storage_locations")
      .delete()
      .eq("id", confirmDelete.id);

    if (error) {
      setDeleteError(error.message);
    } else {
      router.refresh();
      onDelete?.();
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  if (locations.length === 0) {
    return (
      <div className="bg-white border border-[#e4e4e7] rounded-lg p-8 text-center">
        <p className="text-[#898989]">No locations yet</p>
        <p className="text-sm text-[#a1a1aa]">Add your first location to get started</p>
      </div>
    );
  }

  return (
    <>
      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{deleteError}</p>
        </div>
      )}
      <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e4e4e7]">
            <tr>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-12">
                {/* Expand column */}
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Description
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-24">
                Status
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e4e7]">
            {visibleNodes.map((node) => (
              <tr key={node.id} className="hover:bg-[#fafafa]">
                <td className="px-4 py-3">
                  {node.children.length > 0 ? (
                    <button
                      onClick={() => toggleExpand(node.id)}
                      className="p-1 hover:bg-[#f4f4f5] rounded transition-colors"
                    >
                      {expandedIds.has(node.id) ? (
                        <ChevronDown className="w-4 h-4 text-[#71717a]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#71717a]" />
                      )}
                    </button>
                  ) : (
                    <span className="w-5 inline-block" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm font-medium text-[#242424]"
                      style={{ paddingLeft: `${node.level * 20}px` }}
                    >
                      {node.name}
                    </span>
                    {node.level > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-[#f4f4f5] text-[#71717a] rounded">
                        Level {node.level}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#898989]">
                    {node.description || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      node.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {node.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingLocation(node)}
                      className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors text-[#898989] hover:text-[#242424]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(node)}
                      disabled={deletingId === node.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#898989] hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === node.id ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-sm shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-[#242424] mb-2">Confirm Delete</h3>
            <p className="text-sm text-[#71717a] mb-6">
              Are you sure you want to delete "{confirmDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-[#e4e4e7] rounded-lg text-sm text-[#242424] hover:bg-[#f5f5f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLocation && (
        <EditLocationModal
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
          onSave={() => router.refresh()}
        />
      )}
    </>
  );
}