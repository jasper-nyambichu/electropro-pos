'use client';

import { useRef, useState } from 'react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  existingUrl?: string;
  label?: string;
}

export default function ImageUpload({
  onUploadComplete,
  existingUrl,
  label = 'Product Image',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.');
      return;
    }

    setUploading(true);
    setError(null);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'electropro/products');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed. Please try again.');

      const data = await res.json();
      setPreview(data.secure_url);
      onUploadComplete(data.secure_url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(existingUrl || null);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) upload(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
        {label}
      </label>

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all min-h-[200px] ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
        }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Product preview"
              className="w-full h-full object-contain max-h-[200px] rounded-lg"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white animate-spin text-3xl">
                  progress_activity
                </span>
              </div>
            )}
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">
                  Change Image
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
            <span className="material-symbols-outlined text-primary text-5xl">cloud_upload</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">PNG, JPG or WEBP — max 5MB</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {uploading && (
        <p className="text-xs text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          Uploading to cloud...
        </p>
      )}

      {error && (
        <p className="text-xs text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}