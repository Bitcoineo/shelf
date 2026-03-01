"use client";

import { useRef, useState } from "react";

export function ImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Upload failed");
        setUploading(false);
        return;
      }

      onChange(json.url);
    } catch {
      setError("Upload failed");
    }

    setUploading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  const inputClass =
    "mt-1.5 block w-full rounded-md border border-border bg-input-bg px-3 py-2 text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200";

  // Has image — show thumbnail
  if (value) {
    return (
      <div>
        <span className="text-xs font-medium text-muted">Preview Image</span>
        <div className="mt-1.5 relative rounded-md overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full aspect-video object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border border-border rounded-md px-2 py-1 text-xs text-muted hover:text-foreground transition-colors duration-200"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <span className="text-xs font-medium text-muted">
        Preview Image <span className="text-muted/40">(optional)</span>
      </span>

      {error && (
        <p className="text-red-500 text-xs font-mono mt-1">{error}</p>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mt-1.5 border-2 border-dashed rounded-md flex flex-col items-center justify-center py-8 cursor-pointer transition-colors duration-200 ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-border hover:border-muted"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        {uploading ? (
          <p className="text-sm text-muted">Uploading...</p>
        ) : (
          <>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted/40 mb-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-xs text-muted">
              Drop image or click to upload
            </p>
            <p className="text-[10px] text-muted/40 mt-1">
              JPG, PNG, WebP, GIF — max 5MB
            </p>
          </>
        )}
      </div>

      {/* URL fallback */}
      <div className="mt-2">
        <input
          type="url"
          placeholder="or paste image URL"
          onBlur={(e) => {
            const url = e.target.value.trim();
            if (url) {
              onChange(url);
              e.target.value = "";
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const url = (e.target as HTMLInputElement).value.trim();
              if (url) {
                onChange(url);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
          className={inputClass}
        />
      </div>
    </div>
  );
}
