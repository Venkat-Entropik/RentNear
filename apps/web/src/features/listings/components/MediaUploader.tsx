'use client';

// ──────────────────────────────────────────────────────────────────────────────
// MediaUploader.tsx
// Presign → XHR upload to R2 → confirm. Shows per-file progress bars.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, ImagePlus, Star } from 'lucide-react';
import { useUploadMedia, useDeleteMedia } from '../hooks/useListings';
import type { ListingMediaPublic } from '@rentnear/types';

interface MediaUploaderProps {
  listingId: string;
  existingMedia: ListingMediaPublic[];
}

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  previewUrl: string;
}

export function MediaUploader({ listingId, existingMedia }: MediaUploaderProps) {
  const [uploadQueue, setUploadQueue] = useState<FileUploadState[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: upload } = useUploadMedia(listingId);
  const { mutate: remove } = useDeleteMedia(listingId);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: FileUploadState[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: 'pending',
      previewUrl: URL.createObjectURL(file),
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i]!;

      setUploadQueue((prev) =>
        prev.map((q) => (q.previewUrl === item.previewUrl ? { ...q, status: 'uploading' } : q)),
      );

      try {
        await upload({
          file: item.file,
          isPrimary: existingMedia.length === 0 && i === 0,
          onProgress: (pct) => {
            setUploadQueue((prev) =>
              prev.map((q) =>
                q.previewUrl === item.previewUrl ? { ...q, progress: pct } : q,
              ),
            );
          },
        });

        setUploadQueue((prev) =>
          prev.map((q) =>
            q.previewUrl === item.previewUrl ? { ...q, status: 'done', progress: 100 } : q,
          ),
        );
      } catch {
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.previewUrl === item.previewUrl ? { ...q, status: 'error' } : q,
          ),
        );
      }
    }
  };

  const totalSlots = existingMedia.length + uploadQueue.filter((q) => q.status !== 'error').length;
  const canUpload = totalSlots < 10;

  return (
    <div className="space-y-4">
      {/* Existing uploaded media */}
      {existingMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {existingMedia.map((m) => (
            <div key={m.id} className="group relative aspect-square overflow-hidden rounded-[12px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="h-full w-full object-cover" />
              {m.isPrimary && (
                <div className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-pill bg-primary-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  <Star className="h-2.5 w-2.5 fill-white" />
                  Primary
                </div>
              )}
              <button
                onClick={() => remove(m.id)}
                className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-all group-hover:flex"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload queue (in-flight) */}
      {uploadQueue.filter((q) => q.status !== 'done').length > 0 && (
        <div className="space-y-2">
          {uploadQueue
            .filter((q) => q.status !== 'done')
            .map((item) => (
              <div key={item.previewUrl} className="flex items-center gap-3 rounded-[12px] bg-neutral-50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-10 w-10 flex-shrink-0 rounded-[8px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-neutral-700">{item.file.name}</p>
                  {item.status === 'uploading' && (
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <p className="mt-0.5 text-xs text-danger">Upload failed</p>
                  )}
                </div>
                {item.status === 'uploading' ? (
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-primary-500" />
                ) : item.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                ) : null}
              </div>
            ))}
        </div>
      )}

      {/* Upload button */}
      {canUpload && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-neutral-200 py-8 text-sm font-medium text-neutral-500 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
          >
            <ImagePlus className="h-5 w-5" />
            Add Photos ({totalSlots}/10)
          </button>
        </>
      )}
    </div>
  );
}
