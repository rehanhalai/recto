"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Image as ImageIcon,
} from "@phosphor-icons/react";

import { apiInstance } from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from "@/components/ui";
import type { PostWithRelations } from "@recto/types";

type PostEditDialogProps = {
  post: PostWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PostEditDialog({
  post,
  open,
  onOpenChange,
}: PostEditDialogProps) {
  const queryClient = useQueryClient();

  const [content, setContent] = useState(post.content);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(post.image || null);

  const previewUrl = useMemo(() => {
    if (!selectedImage) {
      return null;
    }
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("content", content.trim());
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      return apiInstance.patch(`/posts/${post.id}`, formData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post updated successfully.");
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Unable to update post right now.";
      toast.error(message);
    },
  });

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }

    setSelectedImage(file);
    setCurrentImage(null);
  };

  const canSubmit = content.trim().length > 0 && !updatePostMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] max-h-[90vh] overflow-y-auto rounded-2xl border border-border-subtle bg-paper p-0 sm:w-full sm:max-w-2xl">
        <DialogHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="text-xl text-ink">Edit post</DialogTitle>
          <DialogDescription className="text-ink-muted">
            Update your post content and image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
              Post Content
            </Label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={500}
              placeholder="What do you think about this book?"
              className="min-h-28 w-full rounded-lg border border-border-subtle bg-card-surface px-3 py-2 text-sm text-ink outline-none ring-0 transition focus:border-accent"
            />
            <p className="text-right text-xs text-ink-muted">
              {content.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
              Media
            </Label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="edit-post-media-input"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-subtle bg-card-surface px-3 py-2 text-sm text-ink-muted transition hover:text-ink"
              >
                <ImageIcon size={16} />
                Change image
              </label>
              <input
                id="edit-post-media-input"
                type="file"
                accept="image/*"
                onChange={handleImageSelection}
                className="sr-only"
              />
            </div>

            {(previewUrl || currentImage) && (
              <div className="relative mt-2 h-40 w-full overflow-hidden rounded-lg border border-border-subtle bg-card-surface">
                <Image
                  src={previewUrl || currentImage || ""}
                  alt="Post media preview"
                  fill
                  sizes="(max-width: 640px) 95vw, 640px"
                  className="object-cover"
                  unoptimized={!!previewUrl}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setCurrentImage(null);
                  }}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label="Remove media"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border-subtle px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => updatePostMutation.mutate()}
          >
            {updatePostMutation.isPending ? "Updating..." : "Update Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
