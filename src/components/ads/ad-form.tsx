"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AdPlacement, AD_PLACEMENT_LABELS } from "@/src/types";
import { adsService } from "@/src/services/ads.service";
import { storageService } from "@/src/services/storage.service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Select } from "@/src/components/ui/select";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { ImageCropper } from "@/src/components/ui/image-cropper";
import { getMediaUrl } from "@/src/utils/functions";

const PLACEMENT_ASPECT_RATIOS: Record<AdPlacement, number> = {
  SIDEBAR: 1, // 1:1 square
  TOP_BANNER: 4, // 4:1 wide horizontal banner
  FEED: 1, // 1:1 square
  // FOOTER: 6,        // 6:1 wide footer banner
};

const PLACEMENT_CROP_HINTS: Record<AdPlacement, string> = {
  SIDEBAR: "Square image (1:1)",
  TOP_BANNER: "Wide horizontal banner (4:1)",
  FEED: "Square image (1:1)",
  // FOOTER: "Wide banner (6:1)",
};

interface AdFormProps {
  mode: "create" | "edit";
  adId?: string;
}

export function AdForm({ mode, adId }: AdFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoadingAd, setIsLoadingAd] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // stored URL (from loaded ad)
  const [targetUrl, setTargetUrl] = useState("");
  const [placement, setPlacement] = useState<AdPlacement | "">("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // Image crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null); // raw file data URL → triggers cropper
  const [pendingFile, setPendingFile] = useState<Blob | null>(null); // cropped blob, uploaded on submit
  const [previewUrl, setPreviewUrl] = useState<string>(""); // object URL for preview

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (mode !== "edit" || !adId) return;
    adsService
      .getById(adId)
      .then((ad) => {
        setTitle(ad.title ?? "");
        setDescription(ad.description ?? "");
        setImageUrl(ad.imageUrl ?? "");
        setTargetUrl(ad.targetUrl ?? "");
        setPlacement(ad.placement);
        setStartsAt(ad.startsAt ? ad.startsAt.split("T")[0] : "");
        setEndsAt(ad.endsAt ? ad.endsAt.split("T")[0] : "");
      })
      .catch(() => toast.error("Failed to load ad"))
      .finally(() => setIsLoadingAd(false));
  }, [mode, adId]);

  const handlePlacementChange = (newPlacement: AdPlacement | "") => {
    // If placement changes after a crop, the stored crop has wrong aspect ratio — clear it
    if (pendingFile && newPlacement !== placement) {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPendingFile(null);
      setPreviewUrl("");
    }
    setPlacement(newPlacement);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = (blob: Blob, croppedUrl: string) => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPendingFile(blob);
    setPreviewUrl(croppedUrl);
    setCropSrc(null);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placement) return;

    setIsSubmitting(true);

    let finalImageUrl = imageUrl;

    if (pendingFile) {
      setIsUploading(true);
      try {
        const { uploadUrl, url } = await storageService.getUploadUrl({
          folder: "ads",
          fileExtension: "jpg",
          contentType: "image/jpeg",
          fileSizeBytes: pendingFile.size,
        });
        await storageService.uploadFile(uploadUrl, pendingFile);
        finalImageUrl = url;
      } catch {
        toast.error("Failed to upload image");
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const body = {
      title,
      description: description || undefined,
      image_url: finalImageUrl || undefined,
      target_url: targetUrl || undefined,
      placement,
      starts_at: startsAt || undefined,
      ends_at: endsAt || undefined,
    };

    try {
      if (mode === "create") {
        await adsService.create(body);
        toast.success("Ad created");
      } else if (adId) {
        await adsService.update(adId, body);
        toast.success("Ad updated");
      }
      router.push("/ads/all");
    } catch {
      toast.error(
        mode === "create" ? "Failed to create ad" : "Failed to update ad",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAd) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const displayUrl = previewUrl || (imageUrl ? getMediaUrl(imageUrl) : "");
  const cropHint = placement ? PLACEMENT_CROP_HINTS[placement] : null;

  return (
    <>
      {/* Full-screen cropper — rendered outside the form flow */}
      {cropSrc && placement && (
        <ImageCropper
          image={cropSrc}
          aspect={PLACEMENT_ASPECT_RATIOS[placement]}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Title */}
          <Input
            id="title"
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ad title"
          />

          {/* Description */}
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description…"
            rows={3}
            maxLength={1000}
            showCount
          />

          {/* Target URL */}
          <Input
            id="target_url"
            label="Target URL"
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com"
          />

          {/* Placement — must be set before image can be picked */}
          <Select
            id="placement"
            label="Placement"
            required
            value={placement}
            onChange={(e) =>
              handlePlacementChange(e.target.value as AdPlacement | "")
            }
          >
            <option value="">Select placement…</option>
            {(
              Object.entries(AD_PLACEMENT_LABELS) as [AdPlacement, string][]
            ).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </Select>

          {/* Image */}
          <div>
            <p className="block text-sm font-semibold text-gray-900 mb-1.5">
              Image
            </p>
            <div className="space-y-3">
              {displayUrl && (
                <img
                  src={displayUrl}
                  alt="Ad preview"
                  className="w-full max-h-48 object-cover rounded-lg border border-gray-100"
                />
              )}
              {cropHint && <p className="text-xs text-gray-400">{cropHint}</p>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {!placement ? (
                <p className="text-xs text-gray-400">
                  Select a placement first to enable image upload.
                </p>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {displayUrl ? "Change image" : "Upload image"}
                </Button>
              )}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="starts_at"
              label="Start Date"
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <Input
              id="ends_at"
              label="End Date"
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!title || !placement || isSubmitting || isUploading}
          >
            {isSubmitting || isUploading
              ? isUploading
                ? "Uploading…"
                : mode === "create"
                  ? "Creating…"
                  : "Saving…"
              : mode === "create"
                ? "Create Ad"
                : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/ads/all")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
