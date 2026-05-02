"use client";

import { useState } from "react";
import { deleteAttachment, setPrimaryAttachment } from "@/lib/actions";
import { Button } from "./Button";
import { Image as ImageIcon, FileText, Link2, Trash2, Star, StarOff, X, Loader2 } from "lucide-react";

export interface Attachment {
  id: string;
  asset_id: string;
  type: "image" | "document" | "link";
  name: string | null;
  url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

interface AttachmentsListProps {
  attachments: Attachment[];
  onAdd: () => void;
  onRefresh: () => void;
}

export function AttachmentsList({ attachments, onAdd, onRefresh }: AttachmentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteAttachment(id);
    if (!result?.error) {
      onRefresh();
    }
    setDeletingId(null);
  };

  const handleSetPrimary = async (id: string) => {
    setSettingPrimaryId(id);
    const result = await setPrimaryAttachment(id);
    if (!result?.error) {
      onRefresh();
    }
    setSettingPrimaryId(null);
  };

  const images = attachments.filter((a) => a.type === "image");
  const documents = attachments.filter((a) => a.type === "document");
  const links = attachments.filter((a) => a.type === "link");

  const primaryImage = images.find((a) => a.is_primary) || images[0];
  const otherImages = images.filter((a) => a.id !== primaryImage?.id);

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      case "link":
        return <Link2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {images.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-[#71717a] uppercase tracking-wider mb-3">
              Photos ({images.length}/10)
            </h3>
            
            <div className="grid grid-cols-4 gap-3">
              {primaryImage && (
                <div className="col-span-2 row-span-2 relative group">
                  <div
                    className="aspect-square rounded-lg overflow-hidden bg-[#f4f4f5] cursor-pointer"
                    onClick={() => setLightboxUrl(primaryImage.url)}
                  >
                    <img
                      src={primaryImage.url}
                      alt={primaryImage.name || "Asset image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {primaryImage.is_primary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#242424] text-white text-xs rounded">
                      Primary
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!primaryImage.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(primaryImage.id)}
                        disabled={settingPrimaryId === primaryImage.id}
                        className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50"
                        title="Set as primary"
                      >
                        {settingPrimaryId === primaryImage.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <StarOff className="w-3 h-3 text-[#71717a]" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(primaryImage.id)}
                      disabled={deletingId === primaryImage.id}
                      className="p-1.5 bg-white rounded-lg shadow hover:bg-red-50"
                      title="Delete"
                    >
                      {deletingId === primaryImage.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3 h-3 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {otherImages.map((img) => (
                <div key={img.id} className="relative aspect-square group">
                  <div
                    className="w-full h-full rounded-lg overflow-hidden bg-[#f4f4f5] cursor-pointer"
                    onClick={() => setLightboxUrl(img.url)}
                  >
                    <img
                      src={img.url}
                      alt={img.name || "Asset image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!img.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(img.id)}
                        disabled={settingPrimaryId === img.id}
                        className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50"
                        title="Set as primary"
                      >
                        {settingPrimaryId === img.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <StarOff className="w-3 h-3 text-[#71717a]" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(img.id)}
                      disabled={deletingId === img.id}
                      className="p-1.5 bg-white rounded-lg shadow hover:bg-red-50"
                      title="Delete"
                    >
                      {deletingId === img.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3 h-3 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {images.length < 10 && (
                <button
                  onClick={onAdd}
                  className="aspect-square rounded-lg border-2 border-dashed border-[#e4e4e7] hover:border-[#a1a1aa] flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-[#a1a1aa]" />
                  <span className="text-xs text-[#a1a1aa]">Add Photo</span>
                </button>
              )}
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-[#e4e4e7] rounded-lg">
            <ImageIcon className="w-8 h-8 text-[#a1a1aa] mx-auto mb-2" />
            <p className="text-sm text-[#71717a] mb-3">No photos yet</p>
            <Button variant="secondary" size="sm" onClick={onAdd}>
              Add Photo
            </Button>
          </div>
        )}

        {(documents.length > 0 || links.length > 0) && (
          <div>
            <h3 className="text-xs font-medium text-[#71717a] uppercase tracking-wider mb-3">
              Documents & Links
            </h3>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-lg group"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <FileText className="w-4 h-4 text-[#71717a] flex-shrink-0" />
                    <span className="text-sm text-[#242424] truncate">
                      {doc.name || "Document"}
                    </span>
                  </a>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="p-1.5 hover:bg-red-50 rounded"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3 h-3 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-lg group"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <Link2 className="w-4 h-4 text-[#71717a] flex-shrink-0" />
                    <span className="text-sm text-[#242424] truncate">
                      {link.name || "Link"}
                    </span>
                  </a>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(link.id)}
                      disabled={deletingId === link.id}
                      className="p-1.5 hover:bg-red-50 rounded"
                    >
                      {deletingId === link.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3 h-3 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(documents.length < 5 || links.length < 5) && (
          <button
            onClick={onAdd}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Document or Link
          </button>
        )}
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}