"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addAttachment, addAttachmentLink } from "@/lib/actions";
import { Input } from "./Input";
import { Button } from "./Button";
import { Upload, X, FileText, Link2, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";

interface AddAttachmentModalProps {
  assetId: string;
  currentCount: number;
  onClose: () => void;
}

export function AddAttachmentModal({ assetId, currentCount, onClose }: AddAttachmentModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const remaining = 10 - currentCount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(selected.type)) {
        setError("File type not allowed. Allowed: JPEG, PNG, WebP, PDF");
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selected);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (remaining <= 0) {
      setError(`Maximum of 10 attachments allowed per asset`);
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      if (uploadType === "file" && file) {
        const type = file.type.startsWith("image/") ? "image" : "document";
        const result = await addAttachment(assetId, file, type, name || file.name);

        if (result?.error) {
          setError(result.error);
          setIsUploading(false);
          return;
        }
      } else if (uploadType === "link" && linkUrl) {
        const result = await addAttachmentLink(assetId, linkUrl, linkName || linkUrl);

        if (result?.error) {
          setError(result.error);
          setIsUploading(false);
          return;
        }
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError("An unexpected error occurred");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#242424]">Add Attachment</h2>
              <p className="text-xs text-[#71717a]">{remaining} slots remaining</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUploadType("file")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
                uploadType === "file"
                  ? "bg-[#242424] text-white"
                  : "bg-[#f4f4f5] text-[#242424] hover:bg-[#e4e4e7]"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadType("link")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
                uploadType === "link"
                  ? "bg-[#242424] text-white"
                  : "bg-[#f4f4f5] text-[#242424] hover:bg-[#e4e4e7]"
              }`}
            >
              <Link2 className="w-4 h-4" />
              Add Link
            </button>
          </div>

          {uploadType === "file" ? (
            <>
              {file ? (
                <div className="p-4 bg-[#f9f9f9] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-5 h-5 text-[#71717a] flex-shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-[#71717a] flex-shrink-0" />
                    )}
                    <span className="text-sm text-[#242424] truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 hover:bg-[#e4e4e7] rounded flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-[#71717a]" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e4e4e7] rounded-lg p-8 text-center cursor-pointer hover:border-[#a1a1aa] transition-colors"
                >
                  <Upload className="w-8 h-8 text-[#a1a1aa] mx-auto mb-2" />
                  <p className="text-sm text-[#71717a]">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-[#a1a1aa] mt-1">
                    JPEG, PNG, WebP, PDF (max 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <Input
                label="Display Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Front view, Invoice 2024"
              />
            </>
          ) : (
            <>
              <Input
                label="URL"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                required
              />
              <Input
                label="Display Name (optional)"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="e.g., Product manual"
              />
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} loading={isUploading} disabled={uploadType === "file" ? !file : !linkUrl} className="flex-1">
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}