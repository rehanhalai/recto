"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Cropper, { Area, Point } from "react-easy-crop";
import { PencilSimpleIcon } from "@phosphor-icons/react";

import { getCroppedImageFile } from "@/lib/image-crop";
import { toast } from "@/lib/toast";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/components/ui";

type AvatarImagePickerProps = {
  label?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  currentImageUrl?: string | null;
  disabled?: boolean;
  maxSizeMB?: number;
};

export function AvatarImagePicker({
  label = "Profile picture (optional)",
  value,
  onChange,
  currentImageUrl,
  disabled = false,
  maxSizeMB = 5,
}: AvatarImagePickerProps) {
  const fileInputId = "avatar-image-picker-input";
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);

  const selectedPreviewUrl = useMemo(() => {
    if (!value) {
      return null;
    }
    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  useEffect(() => {
    return () => {
      if (sourceImageUrl) {
        URL.revokeObjectURL(sourceImageUrl);
      }
    };
  }, [sourceImageUrl]);

  const previewUrl = selectedPreviewUrl || currentImageUrl || null;

  const onCropComplete = (_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      event.target.value = "";
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Image must be ${maxSizeMB}MB or smaller.`);
      event.target.value = "";
      return;
    }

    const nextSourceUrl = URL.createObjectURL(file);
    setSourceImageUrl(nextSourceUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsCropOpen(true);
    event.target.value = "";
  };

  const handleApplyCrop = async () => {
    if (!sourceImageUrl || !croppedAreaPixels) {
      toast.error("Select a crop area first.");
      return;
    }

    setIsApplyingCrop(true);

    try {
      const croppedFile = await getCroppedImageFile(
        sourceImageUrl,
        croppedAreaPixels,
        "avatar.jpg",
      );
      onChange(croppedFile);
      setIsCropOpen(false);
      toast.success("Profile image ready.");
    } catch (error) {
      console.error("Image crop failed", error);
      toast.error("Could not crop image. Please try another one.");
    } finally {
      setIsApplyingCrop(false);
    }
  };

  return (
    <div>
      <Label className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]">
        {label}
      </Label>

      <div className="mt-3 flex flex-col items-center gap-3">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#caa777] bg-[#f8f3ea] shadow-[0_10px_26px_rgba(122,86,39,0.2)] dark:border-[#6d5335] dark:bg-[#1e1813]">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Profile image preview"
              fill
              sizes="112px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#9a8d80] dark:text-[#8f7f6b]">
              Preview
            </div>
          )}

          <label
            htmlFor={fileInputId}
            className="absolute bottom-1 right-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#cfb286] bg-[#f3e4cf] text-[#6d5335] transition hover:brightness-95 dark:border-[#5b472f] dark:bg-[#2a2118] dark:text-[#d6b383]"
            aria-label="Change profile picture"
          >
            <PencilSimpleIcon size={16} weight="bold" />
          </label>
        </div>

        <Input
          id={fileInputId}
          type="file"
          accept="image/*"
          onChange={handleSelectFile}
          disabled={disabled}
          className="sr-only"
        />

        <p className="text-xs text-[#7f7062] dark:text-[#a1907b]">
          Tap the pencil icon to upload and crop.
        </p>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            className="h-7 px-2 text-xs text-[#8a6b37] hover:text-[#705630]"
          >
            Remove selected image
          </Button>
        )}
      </div>

      <Dialog
        open={isCropOpen}
        onOpenChange={(open) => {
          setIsCropOpen(open);
          if (!open) {
            setSourceImageUrl(null);
            setCroppedAreaPixels(null);
          }
        }}
      >
        <DialogContent className="border-[#dfd2c1] bg-[#f6efe5] p-0 sm:max-w-xl dark:border-[#352d24] dark:bg-[#201a14]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-[#1f1a16] dark:text-[#f4eee5]">
              Crop profile picture
            </DialogTitle>
            <DialogDescription className="text-[#6f6154] dark:text-[#a1907b]">
              Adjust the crop to choose what appears in your avatar.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6">
            <div className="relative h-72 overflow-hidden rounded-lg border border-[#d8c7b1] bg-[#1a1714] dark:border-[#3a3128]">
              {sourceImageUrl && (
                <Cropper
                  image={sourceImageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]">
                Zoom
              </Label>
              <Input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="h-10"
              />
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCropOpen(false)}
              className="text-[#8a6b37] hover:bg-[#f0e5d7] hover:text-[#705630] dark:hover:bg-[#251e17]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApplyCrop}
              disabled={isApplyingCrop}
              className="bg-[#1f1a16] text-[#faf5eb] hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
            >
              {isApplyingCrop ? "Applying..." : "Apply crop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
